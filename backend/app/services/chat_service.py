"""
Chat Service
Handles chat conversations about analyses using RAG (Retrieval-Augmented Generation)
"""

from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from ..models.models import Analysis, ChatMessage, Document
from .rate_limit_service import rate_limit_service
from .rag_service import rag_service
from .llm_service import llm_service


class ChatService:
    """Service for handling chat conversations about analyses"""
    
    async def ask_question(
        self,
        analysis_id: int,
        user_id: str,
        question: str,
        db: Session
    ) -> Dict:
        """
        Process a chat question about an analysis using RAG
        
        Args:
            analysis_id: The analysis to ask about
            user_id: The user asking the question
            question: The question text
            db: Database session
            
        Returns:
            Dict with answer, context, and metadata
        """
        # 1. Get the analysis first
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            raise ValueError("Analysis not found")
        
        # 2. Validate rate limits (NOT async, correct params!)
        current_questions = analysis.chat_questions_count or 0
        rate_limit_service.validate_chat_request(
            user_id=user_id,
            analysis_id=analysis_id,
            current_questions_for_analysis=current_questions,
            db=db
        )
        
        # 3. Get relevant context using RAG
        context_chunks = await self._get_relevant_context(
            startup_id=analysis.startup_id,
            question=question,
            db=db
        )
        
        # 4. Build context string
        context_str = self._build_context_string(context_chunks, analysis)
        
        # 5. Generate answer using LLM
        answer, tokens_used = await self._generate_answer(
            question=question,
            context=context_str,
            analysis=analysis
        )
        
        # 6. Calculate estimated cost
        estimated_cost = self._calculate_cost(tokens_used)
        
        # 7. Save chat message
        chat_message = ChatMessage(
            analysis_id=analysis_id,
            user_id=user_id,
            question=question,
            answer=answer,
            context_chunks=context_chunks,
            tokens_used=tokens_used,
            estimated_cost=estimated_cost
        )
        db.add(chat_message)
        
        # 8. Increment counters (NOT async!)
        rate_limit_service.increment_question_counters(user_id, db)
        
        # Increment analysis question count
        analysis.chat_questions_count = (analysis.chat_questions_count or 0) + 1
        
        db.commit()
        db.refresh(chat_message)
        
        return {
            "question": question,
            "answer": answer,
            "created_at": chat_message.created_at,
            "tokens_used": tokens_used,
            "estimated_cost": estimated_cost
        }
    
    async def get_chat_history(
        self,
        analysis_id: int,
        db: Session
    ) -> List[Dict]:
        """Get chat history for an analysis"""
        messages = db.query(ChatMessage).filter(
            ChatMessage.analysis_id == analysis_id
        ).order_by(ChatMessage.created_at.asc()).all()
        
        return [
            {
                "question": msg.question,
                "answer": msg.answer,
                "created_at": msg.created_at,
                "tokens_used": msg.tokens_used,
                "estimated_cost": msg.estimated_cost
            }
            for msg in messages
        ]
    
    async def _get_relevant_context(
        self,
        startup_id: int,
        question: str,
        db: Session,
        top_k: int = 5
    ) -> List[Dict]:
        """
        Retrieve relevant context chunks using FAISS vector search
        
        Args:
            startup_id: The startup to search within
            question: The user's question
            db: Database session
            top_k: Number of top chunks to retrieve
            
        Returns:
            List of context chunks with text and metadata
        """
        try:
            # Use existing RAG service - correct function name!
            results = await rag_service.get_context(
                startup_id=startup_id,
                query=question,
                max_chunks=top_k
            )
            
            # Results are already strings, format them as dicts
            context_chunks = []
            for i, text in enumerate(results):
                context_chunks.append({
                    "text": text,
                    "document_id": None,
                    "filename": f"Document {i+1}",
                    "score": 1.0
                })
            
            return context_chunks
        
        except Exception as e:
            print(f"Error retrieving context: {e}")
            # Fallback: return empty context
            return []
    
    def _build_context_string(
        self,
        context_chunks: List[Dict],
        analysis: Analysis
    ) -> str:
        """Build formatted context string for the LLM"""
        
        # Start with analysis summary
        context_parts = []
        
        # Add analysis summary if available
        if analysis.summary:
            context_parts.append(f"**סיכום הניתוח:**\n{analysis.summary}\n")
        
        # Add key insights
        if analysis.key_insights:
            insights = analysis.key_insights
            if isinstance(insights, list):
                insights_str = "\n".join([f"- {insight}" for insight in insights])
            else:
                insights_str = str(insights)
            context_parts.append(f"**תובנות מרכזיות:**\n{insights_str}\n")
        
        # ⭐ ADD SCORES INFORMATION ⭐
        # Get the scores for this startup
        from ..models.models import Score
        from sqlalchemy.orm import object_session
        
        db = object_session(analysis)
        if db:
            score = db.query(Score).filter(
                Score.startup_id == analysis.startup_id
            ).order_by(Score.created_at.desc()).first()
            
            if score:
                context_parts.append(f"""**ציוני ההערכה:**
    - ציון כללי: {score.overall_score:.1f}/100
    - צוות (Team): {score.team_score:.1f}/100
    - מוצר (Product): {score.product_score:.1f}/100
    - שוק (Market): {score.market_score:.1f}/100
    - משיכה (Traction): {score.traction_score:.1f}/100
    - פיננסים (Financials): {score.financials_score:.1f}/100
    - חדשנות (Innovation): {score.innovation_score:.1f}/100

    **הסבר לציונים:**
    {score.reasoning if score.reasoning else 'אין הסבר זמין'}
    """)
        
        # Add strengths/weaknesses
        if analysis.strengths:
            strengths = analysis.strengths
            if isinstance(strengths, list):
                strengths_str = "\n".join([f"- {s}" for s in strengths])
            else:
                strengths_str = str(strengths)
            context_parts.append(f"**חוזקות:**\n{strengths_str}\n")
        
        if analysis.weaknesses:
            weaknesses = analysis.weaknesses
            if isinstance(weaknesses, list):
                weaknesses_str = "\n".join([f"- {w}" for w in weaknesses])
            else:
                weaknesses_str = str(weaknesses)
            context_parts.append(f"**חולשות:**\n{weaknesses_str}\n")
        
        # Add relevant document chunks
        if context_chunks:
            context_parts.append("\n**קטעים רלוונטיים ממסמכים:**")
            for i, chunk in enumerate(context_chunks[:3], 1):  # Top 3 most relevant
                filename = chunk.get("filename", "מסמך")
                text = chunk.get("text", "")[:500]  # Limit chunk size
                context_parts.append(f"\n{i}. מתוך {filename}:\n{text}")
        
        return "\n\n".join(context_parts)
    
    async def _generate_answer(
        self,
        question: str,
        context: str,
        analysis: Analysis
    ) -> tuple:
        """
        Generate answer using LLM with RAG context
        
        Returns:
            Tuple of (answer, tokens_used)
        """
        
        # Build prompt in English with instruction to match user's language
        system_prompt = """You are an expert AI assistant specializing in startup analysis and venture capital due diligence.

    CRITICAL: Respond in the SAME LANGUAGE as the user's question (Hebrew if Hebrew, English if English)."""

        prompt = f"""A user has asked a specific question about a startup analysis that has already been completed.

    === ANALYSIS CONTEXT ===
    {context}

    === USER'S QUESTION ===
    {question}

    === INSTRUCTIONS ===
    1. Answer ONLY the specific question asked - stay focused
    2. Base your answer STRICTLY on the context provided above
    3. If the information is not in the context, clearly state that in the same language
    4. Keep your answer concise and professional (3-5 sentences)
    5. If asked about scores/ratings, explain the reasoning behind them using the context

    Answer (in the same language as the question):"""
        
        try:
            # Use LLM service - it returns a dict with 'response' key
            result = await llm_service.generate(
                prompt=prompt,
                context=None,
                temperature=0.7,
                max_tokens=1000  # Increased from 500
            )
            
            # Extract answer from response
            # llm_service.generate returns either a string or dict
            if isinstance(result, dict):
                answer = result.get('response', result.get('text', str(result)))
            else:
                answer = str(result)
            
            answer = answer.strip()
            
            # If answer is empty or too short, provide fallback
            if not answer or len(answer) < 10:
                if any(ord(c) > 127 for c in question):  # Hebrew
                    answer = "מצטער, לא הצלחתי לייצר תשובה מספקת. אנא נסה לנסח את השאלה אחרת."
                else:
                    answer = "Sorry, I couldn't generate a sufficient answer. Please try rephrasing your question."
            
            # Estimate tokens (rough calculation)
            tokens_used = len(prompt.split()) + len(answer.split())
            
            return answer, tokens_used
        
        except Exception as e:
            print(f"Error generating answer: {e}")
            import traceback
            traceback.print_exc()
            
            # Return error in same language as question
            if any(ord(c) > 127 for c in question):  # Hebrew or non-ASCII
                return "מצטער, אירעה שגיאה בעיבוד השאלה. אנא נסה שוב.", 0
            else:
                return "Sorry, an error occurred while processing your question. Please try again.", 0
            
    def _calculate_cost(self, tokens_used: int) -> float:
        """Calculate estimated cost based on tokens used"""
        # Gemini 2.5 Flash pricing (approximate)
        # Input: $0.075 per 1M tokens
        # Output: $0.30 per 1M tokens
        # Assuming 50/50 split for simplicity
        cost_per_1m_tokens = 0.20  # Average
        return (tokens_used / 1_000_000) * cost_per_1m_tokens


# Singleton instance
chat_service = ChatService()