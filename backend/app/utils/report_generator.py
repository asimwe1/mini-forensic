from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_pdf_report(report_data, output_path):
    """
    Generates a PDF investigation report.

    :param report_data: Dictionary containing the analysis data.
    :param output_path: Path where the PDF will be saved.
    """
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica", 12)
    c.drawString(100, height - 50, "Investigation Report")

    y_position = height - 100
    for key, value in report_data.items():
        c.drawString(100, y_position, f"{key}: {value}")
        y_position -= 20

    c.save()

# Example usage
report_data = {
    "Case ID": "12345",
    "Investigator": "John Doe",
    "Date": "2023-10-01",
    "Summary": "This is a summary of the investigation.",
    "Details": "Detailed analysis and findings go here."
}

output_path = "/home/landry/Documents/projects/python/mini-forensic/backend/app/reports/investigation_report.pdf"
generate_pdf_report(report_data, output_path)