import google.generativeai as genai
from typing import List, Dict, Any, Optional
from ..config import settings


class LLMService:
    """Service for interacting with Google Gemini LLM"""
    
    def __init__(self):
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
    async def generate(
        self,
        prompt: str,
        context: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """Generate text using Gemini"""
        try:
            full_prompt = prompt
            if context:
                full_prompt = f"Context:\n{context}\n\n{prompt}"
            
            generation_config = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            }
            
            response = self.model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            
            return response.text
            
        except Exception as e:
            raise Exception(f"LLM generation failed: {str(e)}")
    
    async def generate_structured(
        self,
        prompt: str,
        context: Optional[str] = None,
        schema: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Generate structured JSON output"""
        try:
            structured_prompt = f"""{prompt}

Please respond ONLY with valid JSON matching this format.
Do not include any markdown formatting or additional text.
"""
            if schema:
                structured_prompt += f"\nExpected JSON schema: {schema}"
            
            response_text = await self.generate(
                structured_prompt,
                context=context,
                temperature=0.3
            )
            
            # Clean response
            response_text = response_text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            import json
            return json.loads(response_text)
            
        except Exception as e:
            raise Exception(f"Structured generation failed: {str(e)}")
    
    async def analyze_with_context(
        self,
        query: str,
        context_chunks: List[str],
        analysis_type: str = "general"
    ) -> Dict[str, Any]:
        """Analyze with RAG context"""
        context = "\n\n---\n\n".join(context_chunks)
        
        prompt = f"""You are an expert startup analyst. Analyze the following information about a startup.

Analysis Type: {analysis_type}

Question/Task: {query}

Based on the provided context, give a comprehensive analysis including:
1. Key insights
2. Strengths
3. Weaknesses  
4. Opportunities
5. Potential risks or red flags

Be specific and cite evidence from the context."""

        return await self.generate_structured(
            prompt=prompt,
            context=context,
            schema={
                "summary": "string",
                "key_insights": ["string"],
                "strengths": ["string"],
                "weaknesses": ["string"],
                "opportunities": ["string"],
                "risks": ["string"]
            }
        )


# Singleton instance
llm_service = LLMService()