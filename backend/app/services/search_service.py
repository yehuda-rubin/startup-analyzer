from typing import List, Dict, Any, Optional
import asyncio
import json
from ..config import settings


class WebSearchService:
    """Service for web search validation using Tavily API"""
    
    def __init__(self):
        """Initialize with graceful degradation if no API key"""
        self.tavily_enabled = False
        self.client = None
        
        # ✅ Check if Tavily is available
        if not settings.TAVILY_API_KEY:
            print("⚠️ TAVILY_API_KEY not set - web search DISABLED (analysis will work without it)")
            return
        
        try:
            from tavily import AsyncTavilyClient
            self.client = AsyncTavilyClient(api_key=settings.TAVILY_API_KEY)
            self.tavily_enabled = True
            print("✅ Tavily Search Service initialized")
        except ImportError:
            print("⚠️ tavily-python not installed - web search disabled")
        except Exception as e:
            print(f"⚠️ Tavily init failed: {e} - web search disabled")
    
    async def generate_search_queries(
        self,
        startup_name: str,
        industry: Optional[str] = None,
        founder_names: Optional[List[str]] = None
    ) -> List[str]:
        """Generate smart search queries using LLM"""
        
        if not self.tavily_enabled:
            return []
        
        from .llm_service import llm_service
        
        context = f"""
Startup Name: {startup_name}
Industry: {industry or 'Unknown'}
Founders: {', '.join(founder_names) if founder_names else 'Unknown'}
"""
        
        prompt = f"""Generate 3-5 specific search queries to validate this startup's claims.

Focus on:
1. Market size verification (e.g., "{industry} market size 2024")
2. Competitor discovery (e.g., "{startup_name} competitors")
3. Founder reputation (if available)
4. Recent news or red flags

Return ONLY a JSON array of strings:
["query 1", "query 2", "query 3"]

Do NOT include markdown, explanations, or code blocks."""

        try:
            response_text = await llm_service.generate(
                prompt=prompt,
                context=context,
                temperature=0.3
            )
            
            # Clean and parse
            cleaned = response_text.strip()
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0]
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0]
            
            queries = json.loads(cleaned.strip())
            
            if not isinstance(queries, list) or len(queries) < 2:
                raise ValueError("Invalid query format")
            
            print(f"🔍 Generated {len(queries)} search queries")
            return queries[:5]
            
        except Exception as e:
            print(f"⚠️ LLM query generation failed: {e}")
            # Fallback to basic queries
            return [
                f"{startup_name} competitors 2024",
                f"{industry} market size" if industry else f"{startup_name} market",
                f"{startup_name} news reviews"
            ]
    
    async def execute_search(
        self,
        queries: List[str],
        max_results: int = 3
    ) -> Dict[str, Any]:
        """Execute searches asynchronously using Tavily"""
        
        if not self.tavily_enabled or not self.client:
            return {
                "queries": queries,
                "results": [],
                "total_sources": 0,
                "search_successful": False,
                "error": "Tavily not configured"
            }
        
        print(f"\n{'='*60}")
        print(f"🌐 EXECUTING WEB SEARCH")
        print(f"{'='*60}")
        print(f"📝 Queries: {len(queries)}")
        
        all_results = {
            "queries": queries,
            "results": [],
            "total_sources": 0,
            "search_successful": True
        }
        
        try:
            # Execute all searches concurrently
            tasks = [
                self.client.search(
                    query=query,
                    max_results=max_results,
                    search_depth="basic",
                    include_raw_content=False,
                    include_images=False
                )
                for query in queries
            ]
            
            search_responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for i, (query, response) in enumerate(zip(queries, search_responses)):
                if isinstance(response, Exception):
                    print(f"❌ Query {i+1} failed: {str(response)[:100]}")
                    continue
                
                query_results = []
                for result in response.get("results", []):
                    query_results.append({
                        "title": result.get("title", "No title"),
                        "url": result.get("url", ""),
                        "content": result.get("content", "")[:500],
                        "score": result.get("score", 0)
                    })
                
                all_results["results"].append({
                    "query": query,
                    "sources": query_results,
                    "count": len(query_results)
                })
                all_results["total_sources"] += len(query_results)
                
                print(f"✅ Query {i+1}: '{query}' → {len(query_results)} results")
            
            print(f"🎯 Total sources found: {all_results['total_sources']}")
            
        except Exception as e:
            print(f"❌ Search execution failed: {e}")
            all_results["search_successful"] = False
            all_results["error"] = str(e)
        
        print(f"{'='*60}\n")
        return all_results
    
    def format_results_for_llm(self, search_results: Dict[str, Any]) -> str:
        """Format search results into clean text for LLM context"""
        
        if not search_results.get("search_successful", False):
            return ""
        
        if search_results.get("total_sources", 0) == 0:
            return ""
        
        formatted = "=== WEB SEARCH VALIDATION RESULTS ===\n\n"
        
        for item in search_results.get("results", []):
            query = item.get("query", "Unknown query")
            sources = item.get("sources", [])
            
            formatted += f"QUERY: {query}\n"
            formatted += f"{'─' * 50}\n"
            
            if not sources:
                continue
            
            for i, source in enumerate(sources[:3], 1):
                formatted += f"{i}. {source.get('title', 'No title')}\n"
                formatted += f"   URL: {source.get('url', 'N/A')}\n"
                formatted += f"   Content: {source.get('content', 'N/A')[:300]}...\n"
                formatted += f"   Relevance: {source.get('score', 0):.2f}\n\n"
            
            formatted += "\n"
        
        formatted += f"\n=== SUMMARY ===\n"
        formatted += f"Total queries: {len(search_results.get('queries', []))}\n"
        formatted += f"Total sources: {search_results.get('total_sources', 0)}\n"
        
        return formatted
    
    async def validate_startup_claims(
        self,
        startup_name: str,
        industry: Optional[str] = None,
        founder_names: Optional[List[str]] = None
    ) -> str:
        """Complete validation flow: generate queries → search → format"""
        
        # ✅ Return empty if Tavily not enabled
        if not self.tavily_enabled or not self.client:
            print("⚠️ Tavily disabled - skipping web validation")
            return ""
        
        try:
            # Step 1: Generate queries
            queries = await self.generate_search_queries(
                startup_name=startup_name,
                industry=industry,
                founder_names=founder_names
            )
            
            if not queries:
                return ""
            
            # Step 2: Execute searches
            results = await self.execute_search(queries, max_results=3)
            
            # Step 3: Format for LLM
            formatted = self.format_results_for_llm(results)
            
            return formatted
            
        except Exception as e:
            print(f"⚠️ Validation failed (continuing without web search): {e}")
            return ""


# Singleton instance
search_service = WebSearchService()