import sys
sys.path.append('g:/Website/AI2Word_Project')
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

doc = Document("test.docx")
for table in doc.tables:
    tblPr = table._element.xpath('w:tblPr')
    if not tblPr:
        tblPr = OxmlElement('w:tblPr')
        table._element.insert(0, tblPr)
    else:
        tblPr = tblPr[0]
        
    tblBorders = tblPr.xpath('w:tblBorders')
    if not tblBorders:
        tblBorders = OxmlElement('w:tblBorders')
        tblPr.append(tblBorders)
    else:
        tblBorders = tblBorders[0]
        tblBorders.clear()

    for border_name in ['w:top', 'w:left', 'w:bottom', 'w:right', 'w:insideH', 'w:insideV']:
        border = OxmlElement(border_name)
        border.set(qn('w:val'), 'single')
        border.set(qn('w:sz'), '4')
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), '000000')
        tblBorders.append(border)

doc.save("test_border.docx")
print("Saved")
