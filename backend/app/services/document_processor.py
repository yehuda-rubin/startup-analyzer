import os
from typing import Dict, Any, List
from PyPDF2 import PdfReader
from docx import Document as DocxDocument
from pptx import Presentation
import openpyxl


class DocumentProcessor:
    """Process various document types and extract text"""
    
    @staticmethod
    def process_pdf(file_path: str) -> Dict[str, Any]:
        """Extract text from PDF"""
        try:
            reader = PdfReader(file_path)
            text = ""
            metadata = {
                "pages": len(reader.pages),
                "file_type": "pdf"
            }
            
            for page in reader.pages:
                text += page.extract_text() + "\n\n"
            
            return {
                "text": text.strip(),
                "metadata": metadata
            }
        except Exception as e:
            raise Exception(f"PDF processing failed: {str(e)}")
    
    @staticmethod
    def process_docx(file_path: str) -> Dict[str, Any]:
        """Extract text from DOCX"""
        try:
            doc = DocxDocument(file_path)
            text = "\n\n".join([para.text for para in doc.paragraphs if para.text])
            
            metadata = {
                "paragraphs": len(doc.paragraphs),
                "file_type": "docx"
            }
            
            return {
                "text": text.strip(),
                "metadata": metadata
            }
        except Exception as e:
            raise Exception(f"DOCX processing failed: {str(e)}")
    
    @staticmethod
    def process_pptx(file_path: str) -> Dict[str, Any]:
        """Extract text from PPTX"""
        try:
            prs = Presentation(file_path)
            text = ""
            
            for i, slide in enumerate(prs.slides):
                text += f"\n--- Slide {i+1} ---\n"
                for shape in slide.shapes:
                    if hasattr(shape, "text"):
                        text += shape.text + "\n"
            
            metadata = {
                "slides": len(prs.slides),
                "file_type": "pptx"
            }
            
            return {
                "text": text.strip(),
                "metadata": metadata
            }
        except Exception as e:
            raise Exception(f"PPTX processing failed: {str(e)}")
    
    @staticmethod
    def process_xlsx(file_path: str) -> Dict[str, Any]:
        """Extract text from XLSX"""
        try:
            wb = openpyxl.load_workbook(file_path, data_only=True)
            text = ""
            
            for sheet_name in wb.sheetnames:
                sheet = wb[sheet_name]
                text += f"\n--- Sheet: {sheet_name} ---\n"
                
                for row in sheet.iter_rows(values_only=True):
                    row_text = "\t".join([str(cell) if cell is not None else "" for cell in row])
                    if row_text.strip():
                        text += row_text + "\n"
            
            metadata = {
                "sheets": len(wb.sheetnames),
                "file_type": "xlsx"
            }
            
            return {
                "text": text.strip(),
                "metadata": metadata
            }
        except Exception as e:
            raise Exception(f"XLSX processing failed: {str(e)}")
    
    @classmethod
    def process_file(cls, file_path: str) -> Dict[str, Any]:
        """Process file based on extension"""
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()
        
        processors = {
            ".pdf": cls.process_pdf,
            ".docx": cls.process_docx,
            ".pptx": cls.process_pptx,
            ".xlsx": cls.process_xlsx,
        }
        
        if ext not in processors:
            raise ValueError(f"Unsupported file type: {ext}")
        
        return processors[ext](file_path)


# Singleton instance
document_processor = DocumentProcessor()