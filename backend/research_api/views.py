import os
import json
import requests
from bs4 import BeautifulSoup
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

def crawl_page(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        for element in soup(['script', 'style', 'nav', 'footer', 'iframe', 'noscript']):
            element.decompose()
            
        links = []
        for a in soup.find_all('a', href=True):
            if a['href'].startswith('http'):
                links.append(a['href'])
                
        text = ' '.join(soup.get_text(separator=' ').split())
        return {'text': text, 'links': list(set(links))}
    except Exception as e:
        print(f"Failed to crawl {url}: {e}")
        return {'text': '', 'links': []}

@api_view(['POST'])
def research(request):
    data = request.data
    query = data.get('query')
    serper_key = data.get('serperKey') or os.getenv('SERPER_API_KEY')
    openrouter_key = data.get('openRouterKey') or os.getenv('OPENROUTER_API_KEY')
    model = data.get('model', 'anthropic/claude-3.5-sonnet')
    
    if not query:
        return Response({"error": "Query is required"}, status=status.HTTP_400_BAD_REQUEST)
    if not serper_key or not openrouter_key:
        return Response({"error": "API keys are missing"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        target_url = query
        company_name = query
        search_results = None
        competitor_results = None
        
        if not query.startswith('http'):
            search_res = requests.post(
                'https://google.serper.dev/search',
                headers={'X-API-KEY': serper_key, 'Content-Type': 'application/json'},
                json={'q': f"{query} official company website"}
            ).json()
            search_results = search_res
            
            if search_res.get('organic') and len(search_res['organic']) > 0:
                target_url = search_res['organic'][0]['link']
                kg = search_res.get('knowledgeGraph')
                company_name = kg.get('title') if kg else search_res['organic'][0]['title'].split('-')[0].strip()
            else:
                return Response({"error": "Could not definitively find the official website."}, status=status.HTTP_400_BAD_REQUEST)
                
        comp_res = requests.post(
            'https://google.serper.dev/search',
            headers={'X-API-KEY': serper_key, 'Content-Type': 'application/json'},
            json={'q': f"{company_name or query} competitors, alternatives, similar companies"}
        ).json()
        competitor_results = comp_res
        
        aggregated_text = ""
        sources = [target_url]
        
        home_crawl = crawl_page(target_url)
        aggregated_text += f"[Homepage: {target_url}]\n{home_crawl['text'][:5000]}\n\n"
        
        important_keywords = ['about', 'product', 'service', 'pricing', 'solution']
        sub_pages = []
        import urllib.parse
        domain = urllib.parse.urlparse(target_url).netloc
        for link in home_crawl['links']:
            if domain in link and any(kw in link.lower() for kw in important_keywords):
                if link not in sub_pages:
                    sub_pages.append(link)
            if len(sub_pages) >= 2:
                break
                
        for sub_url in sub_pages:
            sub_crawl = crawl_page(sub_url)
            if len(sub_crawl['text']) > 200:
                aggregated_text += f"[Subpage: {sub_url}]\n{sub_crawl['text'][:3000]}\n\n"
                sources.append(sub_url)
                
        if len(aggregated_text.strip()) < 100:
            aggregated_text = "\n".join([r.get('snippet', '') for r in search_results.get('organic', []) if search_results]) + "\n" + "\n".join([r.get('snippet', '') for r in competitor_results.get('organic', []) if competitor_results])
            
        prompt = f"""
        You are an elite business analyst and intelligence agent.
        Analyze the following information to generate a comprehensive company report.
        
        Company Name Target: {company_name}
        Primary Website: {target_url}
        
        --- RAW CRAWLED DATA ---
        {aggregated_text}
        
        --- SEARCH & COMPETITOR CONTEXT ---
        {json.dumps(competitor_results.get('organic', [])[:8]) if competitor_results else 'None'}
        
        Based on the data above, construct a highly accurate, professional JSON report.
        Identify EXACTLY 3-5 key products/services.
        Identify EXACTLY 3-5 critical business or customer pain points this company solves.
        Identify exactly 3-4 top competitors with their actual websites.
        
        Return ONLY a valid JSON object matching this schema exactly (no markdown formatting, no ```json blocks):
        {{
            "name": "Exact Company Name",
            "website": "URL",
            "phone": "Phone number or 'Not publicly listed'",
            "address": "Full Headquarters Address or 'Not publicly listed'",
            "products": ["Product A", "Product B", "Product C"],
            "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"],
            "competitors": [
                {{ "name": "Competitor 1", "website": "https://comp1.com" }},
                {{ "name": "Competitor 2", "website": "https://comp2.com" }}
            ]
        }}
        """
        
        ai_res = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {openrouter_key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "You are a JSON-only API that outputs strictly valid JSON without any markdown."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"}
            }
        ).json()
        
        if 'error' in ai_res:
            return Response({"error": ai_res['error'].get('message', 'OpenRouter API Error')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        content = ai_res['choices'][0]['message']['content']
        clean_content = content.replace('```json', '').replace('```', '').strip()
        report = json.loads(clean_content)
        report['sources'] = sources
        
        return Response(report)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def send_to_discord(request):
    try:
        discord_token = request.data.get('discordToken') or os.getenv('DISCORD_TOKEN')
        discord_channel = request.data.get('discordChannel') or os.getenv('DISCORD_CHANNEL')
        
        if not discord_token or not discord_channel:
            return Response({"error": "Discord configuration missing"}, status=status.HTTP_400_BAD_REQUEST)
            
        file = request.FILES.get('file')
        payload_json = request.data.get('payload_json')
        
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
            
        files = {'file': (file.name, file, file.content_type)}
        data = {'payload_json': payload_json} if payload_json else {}
        
        res = requests.post(
            f"https://discord.com/api/v10/channels/{discord_channel}/messages",
            headers={'Authorization': f"Bot {discord_token}"},
            data=data,
            files=files
        )
        
        if res.ok:
            return Response({"success": True})
        else:
            return Response({"error": res.text}, status=res.status_code)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
