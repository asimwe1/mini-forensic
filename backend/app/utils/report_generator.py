import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from core.config import settings
import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class ReportGenerationError(Exception):
    """Custom exception for report generation errors."""
    pass

class ReportGenerator:
    def __init__(self):
        self.template_dir = settings.REPORT_TEMPLATE_DIR
        self.output_dir = settings.REPORT_OUTPUT_DIR
        self.logo_path = settings.REPORT_LOGO_PATH
        
    def generate_pdf_report(self, report_data: Dict[str, Any], case_id: str) -> str:
        """Generate a PDF report using configured paths."""
        try:
            template_path = os.path.join(self.template_dir, "report_template.html")
            output_path = os.path.join(
                self.output_dir,
                f"report_{case_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            )
            
            # Ensure output directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # ... report generation code ...
            
            return output_path
        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            raise ReportGenerationError(str(e))

# Example usage (for testing)
if __name__ == "__main__":
    report_data = {
        "Case ID": "12345",
        "Investigator": "John Doe",
        "Date": datetime.now().strftime("%Y-%m-%d"),
        "Summary": "This is a summary of the investigation.",
        "Details": "Detailed analysis and findings go here."
    }
    try:
        generator = ReportGenerator()
        output_path = generator.generate_pdf_report(report_data, "TEST_CASE")
        print(f"Report generated successfully at: {output_path}")
    except ReportGenerationError as e:
        print(f"Error generating report: {e}")