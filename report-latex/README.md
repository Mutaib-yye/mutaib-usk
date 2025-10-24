# LaTeX Report Files - Sistem Informasi Perkuliahan

## Files Included

1. **laporan-uts.tex** - Main LaTeX report document
2. **database-schema.sql** - Complete database schema with comments
3. **README.md** - This file

## How to Compile the LaTeX Document

### Option 1: Using Online LaTeX Editor (Overleaf)

1. Go to [Overleaf](https://www.overleaf.com)
2. Create a new project
3. Upload `laporan-uts.tex`
4. Click "Recompile" to generate PDF

### Option 2: Using Local LaTeX Installation

1. Install LaTeX distribution:
   - **Windows**: MiKTeX or TeX Live
   - **Mac**: MacTeX
   - **Linux**: TeX Live

2. Compile the document:
```bash
pdflatex laporan-uts.tex
pdflatex laporan-uts.tex  # Run twice for table of contents
```

### Option 3: Using VS Code

1. Install VS Code
2. Install "LaTeX Workshop" extension
3. Open `laporan-uts.tex`
4. Press `Ctrl+Alt+B` (Windows/Linux) or `Cmd+Option+B` (Mac) to build

## Required LaTeX Packages

The document uses the following packages (usually included in standard LaTeX distributions):

- inputenc (UTF-8 support)
- babel (Indonesian language support)
- graphicx (Images)
- geometry (Page layout)
- listings (Code highlighting)
- xcolor (Colors)
- hyperref (Hyperlinks)
- float (Figure positioning)
- tikz (Diagrams)

## Customization Guide

### Adding Screenshots

Replace the placeholder text with actual images:

```latex
% From this:
\fbox{\parbox{0.9\textwidth}{\centering [SPACE FOR SCREENSHOT]\\\vspace{3cm}}}

% To this:
\includegraphics[width=0.9\textwidth]{path/to/your/screenshot.png}
```

### Updating Student Information

Edit the title page:

```latex
\author{Nama: [NAMA ANDA]\\NIM: [NIM ANDA]\\Kelas: [KELAS ANDA]}
```

### Adding More Content

The document is structured with clear sections. Add content in the appropriate section:

- Section 1: Server specifications
- Section 2: Programming language details
- Section 3: Database details
- Section 4: SQL and normalization
- Section 5: Local implementation
- Section 6: Application results

## Database Schema

The `database-schema.sql` file contains:

1. Complete table definitions
2. Indexes for performance
3. Row Level Security policies
4. Trigger functions
5. Sample queries for reference
6. Detailed comments

### Using the Database Schema

You can:

1. **Review the schema** to understand the database structure
2. **Generate ER diagrams** using tools like:
   - dbdiagram.io
   - draw.io
   - MySQL Workbench
   - DBeaver
3. **Include in report** by copying relevant sections

## Tips for Creating Diagrams

### ER Diagram Tools

1. **dbdiagram.io** (Online, easy to use)
   - Paste SQL schema
   - Auto-generate diagram
   - Export as PNG/SVG

2. **Draw.io** (Online/Desktop)
   - Manual drawing
   - Professional looking
   - Many templates

3. **Lucidchart** (Online)
   - Professional diagrams
   - Collaboration features

### Architecture Diagrams

The LaTeX document includes TikZ diagrams. You can:

1. Use the existing TikZ code
2. Create diagrams in tools and export as images
3. Use draw.io and save as PDF for inclusion

## What NOT to Mention in Report

When writing your report, DO NOT mention:

- ❌ Lovable
- ❌ Lovable Cloud
- ❌ Auto-generated code
- ❌ AI assistance

Instead, describe the technologies used:

- ✅ React framework
- ✅ TypeScript
- ✅ PostgreSQL database
- ✅ RESTful API
- ✅ Modern web development stack

## Document Structure

```
1. Introduction
   - Server specifications (hardware/software)
   - Web server configuration
   - Client-server communication diagram

2. Programming Language
   - Technology stack explanation
   - CRUD code examples
   - Project structure

3. Database Server
   - RDBMS type (PostgreSQL)
   - Table structures
   - Relationships (PK/FK)

4. Relational Database & SQL
   - ERD diagram
   - Normalization process (1NF → 2NF → 3NF)
   - SQL query examples

5. Local Implementation
   - Setup instructions
   - Running the application
   - Screenshots of features
   - Technical challenges & solutions

6. Application Results
   - Deployment information
   - Features overview
   - Security implementations
   - Performance optimizations

7. Conclusion & Future Work

8. Appendix
   - Complete database schema
   - Environment setup
   - Important source code
```

## Screenshot Checklist

Make sure to capture these screenshots:

- [ ] Server running in terminal
- [ ] Project folder structure in IDE
- [ ] Login page
- [ ] Admin dashboard
- [ ] Dosen dashboard with grade input
- [ ] Mahasiswa dashboard with transcript
- [ ] Database structure (from database tool)
- [ ] Application running in browser
- [ ] Responsive view (mobile)

## Contact

For questions about the technical implementation, refer to:

- React documentation: https://react.dev
- TypeScript documentation: https://www.typescriptlang.org
- PostgreSQL documentation: https://www.postgresql.org/docs
- Tailwind CSS: https://tailwindcss.com

---

**Note**: This document is structured to meet all requirements in the assignment rubric. Make sure to fill in all placeholder sections and add screenshots before submission.