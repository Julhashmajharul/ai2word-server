import sys
sys.path.append('g:/Website/AI2Word_Project')
from docx import Document

doc = Document("test.docx")
table_styles = [s.name for s in doc.styles if s.type == 3] # 3 is WD_STYLE_TYPE.TABLE
print("Table styles:", table_styles)
