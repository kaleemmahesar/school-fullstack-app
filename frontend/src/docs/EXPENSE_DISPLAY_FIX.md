# Expense Display Fix in Dashboard Activity Table

## Issue
Expenses were displaying as "+Rs.1500" in the Dashboard activity table instead of "-Rs.1500" because they were being treated as positive values in the activity data.

## Root Cause
In the recent activities generation logic, expense activities were being added with positive amounts:
```javascript
// Before fix
activities.push({
  id: `expense-${expense.id}`,
  type: 'Expense',
  description: `${expense.description}`,
  date: expense.date,
  category: 'Expenses',
  amount: parseFloat(expense.amount)  // Positive value
});
```

## Solution
Updated the expense activity creation to use negative amounts to properly represent them as outflows:

```javascript
// After fix
activities.push({
  id: `expense-${expense.id}`,
  type: 'Expense',
  description: `${expense.description}`,
  date: expense.date,
  category: 'Expenses',
  amount: -parseFloat(expense.amount)  // Negative value to represent outflow
});
```

Also updated the total calculation logic to use absolute values for expense totals:

```javascript
} else if (activity.category === 'Expenses') {
  totalExpense += Math.abs(activity.amount);  // Use absolute value for expense total
}
```

## Display Logic
The activity table display logic correctly handles positive and negative values:
- Positive amounts (income) are displayed in green with "+" prefix
- Negative amounts (expenses) are displayed in red with "-" prefix

## Financial Summary Consistency
The financial summary calculations in the dashboard statistics remain unchanged as they correctly treat expenses as positive values for aggregation purposes. The change only affects the activity table display where the semantic meaning of expenses as outflows needs to be shown.

## Benefits
- Expenses now properly display as negative values (-Rs.1500) in the activity table
- Consistent with financial best practices where expenses are outflows
- Maintains consistency with other parts of the application that show expenses as negative
- Preserves existing financial summary calculations