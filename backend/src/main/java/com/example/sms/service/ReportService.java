package com.example.sms.service;

import com.example.sms.entity.Attendance;
import com.example.sms.entity.Marks;
import com.example.sms.entity.Student;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // =========================================================================
    // STUDENT REPORTS
    // =========================================================================

    public ByteArrayInputStream generateStudentPdf(List<Student> students) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Add title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Student Roster Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Add Table
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1f, 2.5f, 3f, 2f, 2f, 1.5f});

            // Header Font
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

            addCell(table, "ID", headFont, Element.ALIGN_CENTER);
            addCell(table, "Name", headFont, Element.ALIGN_LEFT);
            addCell(table, "Email", headFont, Element.ALIGN_LEFT);
            addCell(table, "Phone", headFont, Element.ALIGN_LEFT);
            addCell(table, "Course", headFont, Element.ALIGN_LEFT);
            addCell(table, "Semester", headFont, Element.ALIGN_CENTER);

            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            for (Student student : students) {
                addCell(table, String.valueOf(student.getId()), cellFont, Element.ALIGN_CENTER);
                addCell(table, student.getFirstName() + " " + student.getLastName(), cellFont, Element.ALIGN_LEFT);
                addCell(table, student.getEmail(), cellFont, Element.ALIGN_LEFT);
                addCell(table, student.getPhone(), cellFont, Element.ALIGN_LEFT);
                addCell(table, student.getCourse() != null ? student.getCourse().getCourseCode() : "N/A", cellFont, Element.ALIGN_LEFT);
                addCell(table, String.valueOf(student.getSemester()), cellFont, Element.ALIGN_CENTER);
            }

            document.add(table);
            document.close();
        } catch (DocumentException ex) {
            System.err.println("Error generating PDF: " + ex.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateStudentExcel(List<Student> students) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Students");

            // Header Style
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            // Row for headers
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Student ID", "First Name", "Last Name", "Email", "Phone", "Gender", "Date of Birth", "Course", "Semester", "Admission Date"};
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Fill data
            int rowIdx = 1;
            for (Student student : students) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(student.getId());
                row.createCell(1).setCellValue(student.getFirstName());
                row.createCell(2).setCellValue(student.getLastName());
                row.createCell(3).setCellValue(student.getEmail());
                row.createCell(4).setCellValue(student.getPhone());
                row.createCell(5).setCellValue(student.getGender());
                row.createCell(6).setCellValue(student.getDob().format(DATE_FORMATTER));
                row.createCell(7).setCellValue(student.getCourse() != null ? student.getCourse().getCourseName() : "N/A");
                row.createCell(8).setCellValue(student.getSemester());
                row.createCell(9).setCellValue(student.getAdmissionDate().format(DATE_FORMATTER));
            }

            // Auto-size columns
            for (int col = 0; col < columns.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception ex) {
            System.err.println("Error generating Excel: " + ex.getMessage());
            return new ByteArrayInputStream(new byte[0]);
        }
    }

    public ByteArrayInputStream generateStudentCsv(List<Student> students) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            writer.println("StudentID,FirstName,LastName,Email,Phone,Gender,DateOfBirth,Course,Semester,AdmissionDate");
            for (Student s : students) {
                writer.printf("%d,%s,%s,%s,%s,%s,%s,%s,%d,%s\n",
                        s.getId(),
                        escapeCsv(s.getFirstName()),
                        escapeCsv(s.getLastName()),
                        escapeCsv(s.getEmail()),
                        escapeCsv(s.getPhone()),
                        s.getGender(),
                        s.getDob().format(DATE_FORMATTER),
                        escapeCsv(s.getCourse() != null ? s.getCourse().getCourseCode() : "N/A"),
                        s.getSemester(),
                        s.getAdmissionDate().format(DATE_FORMATTER)
                );
            }
            writer.flush();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    // =========================================================================
    // MARKS REPORTS
    // =========================================================================

    public ByteArrayInputStream generateMarksPdf(List<Marks> marks) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Academic Performance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1f, 2.5f, 2.5f, 1.5f, 1.5f, 1f, 1.5f});

            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            addCell(table, "ID", headFont, Element.ALIGN_CENTER);
            addCell(table, "Student", headFont, Element.ALIGN_LEFT);
            addCell(table, "Subject", headFont, Element.ALIGN_LEFT);
            addCell(table, "Obtained", headFont, Element.ALIGN_CENTER);
            addCell(table, "Total", headFont, Element.ALIGN_CENTER);
            addCell(table, "Grade", headFont, Element.ALIGN_CENTER);
            addCell(table, "Status", headFont, Element.ALIGN_CENTER);

            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            for (Marks m : marks) {
                addCell(table, String.valueOf(m.getStudent().getId()), cellFont, Element.ALIGN_CENTER);
                addCell(table, m.getStudent().getFirstName() + " " + m.getStudent().getLastName(), cellFont, Element.ALIGN_LEFT);
                addCell(table, m.getSubject(), cellFont, Element.ALIGN_LEFT);
                addCell(table, String.valueOf(m.getMarksObtained()), cellFont, Element.ALIGN_CENTER);
                addCell(table, String.valueOf(m.getTotalMarks()), cellFont, Element.ALIGN_CENTER);
                addCell(table, m.getGrade(), cellFont, Element.ALIGN_CENTER);
                addCell(table, m.getResultStatus(), cellFont, Element.ALIGN_CENTER);
            }

            document.add(table);
            document.close();
        } catch (DocumentException ex) {
            System.err.println("Error generating Marks PDF: " + ex.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateMarksExcel(List<Marks> marks) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Academic Results");

            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            String[] columns = {"Student ID", "Student Name", "Subject", "Marks Obtained", "Total Marks", "Percentage", "Grade", "Status"};
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (Marks m : marks) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(m.getStudent().getId());
                row.createCell(1).setCellValue(m.getStudent().getFirstName() + " " + m.getStudent().getLastName());
                row.createCell(2).setCellValue(m.getSubject());
                row.createCell(3).setCellValue(m.getMarksObtained());
                row.createCell(4).setCellValue(m.getTotalMarks());
                row.createCell(5).setCellValue(m.getPercentage());
                row.createCell(6).setCellValue(m.getGrade());
                row.createCell(7).setCellValue(m.getResultStatus());
            }

            for (int col = 0; col < columns.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception ex) {
            System.err.println("Error generating Marks Excel: " + ex.getMessage());
            return new ByteArrayInputStream(new byte[0]);
        }
    }

    public ByteArrayInputStream generateMarksCsv(List<Marks> marks) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            writer.println("StudentID,StudentName,Subject,MarksObtained,TotalMarks,Percentage,Grade,Status");
            for (Marks m : marks) {
                writer.printf("%d,%s,%s,%.1f,%.1f,%.2f%%,%s,%s\n",
                        m.getStudent().getId(),
                        escapeCsv(m.getStudent().getFirstName() + " " + m.getStudent().getLastName()),
                        escapeCsv(m.getSubject()),
                        m.getMarksObtained(),
                        m.getTotalMarks(),
                        m.getPercentage(),
                        m.getGrade(),
                        m.getResultStatus()
                );
            }
            writer.flush();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    // =========================================================================
    // ATTENDANCE REPORTS
    // =========================================================================

    public ByteArrayInputStream generateAttendancePdf(List<Attendance> attendances) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Daily Attendance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1f, 3f, 2.5f, 2f, 1.5f});

            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            addCell(table, "ID", headFont, Element.ALIGN_CENTER);
            addCell(table, "Student Name", headFont, Element.ALIGN_LEFT);
            addCell(table, "Course / Sem", headFont, Element.ALIGN_LEFT);
            addCell(table, "Date", headFont, Element.ALIGN_CENTER);
            addCell(table, "Status", headFont, Element.ALIGN_CENTER);

            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            for (Attendance a : attendances) {
                Student s = a.getStudent();
                addCell(table, String.valueOf(s.getId()), cellFont, Element.ALIGN_CENTER);
                addCell(table, s.getFirstName() + " " + s.getLastName(), cellFont, Element.ALIGN_LEFT);
                addCell(table, (s.getCourse() != null ? s.getCourse().getCourseCode() : "N/A") + " - Sem " + s.getSemester(), cellFont, Element.ALIGN_LEFT);
                addCell(table, a.getAttendanceDate().format(DATE_FORMATTER), cellFont, Element.ALIGN_CENTER);
                addCell(table, a.getStatus(), cellFont, Element.ALIGN_CENTER);
            }

            document.add(table);
            document.close();
        } catch (DocumentException ex) {
            System.err.println("Error generating Attendance PDF: " + ex.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateAttendanceExcel(List<Attendance> attendances) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Attendance Records");

            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            String[] columns = {"Student ID", "Student Name", "Course", "Semester", "Date", "Status"};
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (Attendance a : attendances) {
                Student s = a.getStudent();
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(s.getId());
                row.createCell(1).setCellValue(s.getFirstName() + " " + s.getLastName());
                row.createCell(2).setCellValue(s.getCourse() != null ? s.getCourse().getCourseCode() : "N/A");
                row.createCell(3).setCellValue(s.getSemester());
                row.createCell(4).setCellValue(a.getAttendanceDate().format(DATE_FORMATTER));
                row.createCell(5).setCellValue(a.getStatus());
            }

            for (int col = 0; col < columns.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception ex) {
            System.err.println("Error generating Attendance Excel: " + ex.getMessage());
            return new ByteArrayInputStream(new byte[0]);
        }
    }

    public ByteArrayInputStream generateAttendanceCsv(List<Attendance> attendances) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            writer.println("StudentID,StudentName,Course,Semester,Date,Status");
            for (Attendance a : attendances) {
                Student s = a.getStudent();
                writer.printf("%d,%s,%s,%d,%s,%s\n",
                        s.getId(),
                        escapeCsv(s.getFirstName() + " " + s.getLastName()),
                        escapeCsv(s.getCourse() != null ? s.getCourse().getCourseCode() : "N/A"),
                        s.getSemester(),
                        a.getAttendanceDate().format(DATE_FORMATTER),
                        a.getStatus()
                );
            }
            writer.flush();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    // =========================================================================
    // PRIVATE UTILS
    // =========================================================================

    private void addCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
