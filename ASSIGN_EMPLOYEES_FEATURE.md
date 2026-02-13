# Assign Employees Feature

## Overview
Added functionality to assign employees to templates AFTER creation, in addition to during creation.

## Changes Made

### 1. AppraisalContext (`src/contexts/AppraisalContext.tsx`)
- Added `assignEmployeesToTemplate` function to assign/reassign employees to existing templates
- Function calls the PUT API endpoint with `assignedTo` parameter
- Updates local state and reloads data after assignment

### 2. AppraisalContextType (`src/types/appraisal.types.ts`)
- Added `assignEmployeesToTemplate: (templateId: string, employeeIds: string[]) => Promise<void>` to the interface

### 3. Template Detail Page (`src/app/dashboard/appraisals/[id]/page.tsx`)## Added:
- **AssignEmployeesModal component**: Full-featured modal for assigning employees
  - Shows all available employees
  - Pre-selects currently assigned employees
  - "Select All" / "Unselect All" functionality  
  - Visual employee cards with department/position
  - Real-time count of selected employees
- **"Assign Employees" button**: Visible to admins and managers in the template detail header
- Shows current assignment count in template stats

### 4. Templates List Page (`src/app/dashboard/appraisals/page.tsx`)
**To be added:**
- AssignEmployeesModal component (reusable from detail page)
- "Assign" button on each template card
- State management for modal and selected template

## Usage

### From Template Detail Page:
1. Navigate to any template detail page
2. Click "Assign Employees" button in the header  
3. Select/deselect employees in the modal
4. Click "Assign X Employees" to save

### From Templates List (pending):
1. Click "Assign" button on any template card
2. Select/deselect employees in the modal
3. Click "Assign X Employees" to save

## API Endpoint Used
- **PUT** `/api/appraisals/templates/:id`
- Body: `{ assignedTo: string[] }` 
- Deletes existing assignments and creates new ones in a transaction

## Features
✅ Assign employees after template creation
✅ Reassign employees (remove/add)
✅ Visual feedback for current assignments
✅ Works for both draft and published templates  
✅ Real-time employee list from database
✅ Responsive modal design
