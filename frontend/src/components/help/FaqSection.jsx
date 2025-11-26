import React, { useState } from 'react';
import { FaQuestionCircle, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FaqSection = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openQuestion, setOpenQuestion] = useState(null);

  if (!isOpen) return null;

  const faqData = [
    {
      category: "General",
      questions: [
        {
          id: 1,
          question: "How do I change my school's funding model?",
          answer: `
            <p>To change your school's funding model:</p>
            <ol class="list-decimal pl-5 space-y-2 mt-2">
              <li>Go to the Settings page (only accessible to Administrators)</li>
              <li>Find the "School Funding Type" section</li>
              <li>Select either "Traditional School" or "NGO Funded School"</li>
              <li>Click "Save Changes" to apply the new setting</li>
            </ol>
            <p class="mt-3"><strong>Note:</strong> Changing the funding model will immediately update the interface to show or hide relevant sections like Fees or NGO Subsidies.</p>
          `
        },
        {
          id: 2,
          question: "Can I customize the class names?",
          answer: `
            <p>Yes, you can customize class names:</p>
            <ol class="list-decimal pl-5 space-y-2 mt-2">
              <li>Navigate to the Classes section</li>
              <li>Click "Add Class" to create a new class</li>
              <li>Enter your preferred class name (e.g., "Kindergarten", "Grade 1", etc.)</li>
              <li>Define sections for the class if needed</li>
            </ol>
            <p class="mt-3">The system supports any class naming convention that works for your school.</p>
          `
        }
      ]
    },
    {
      category: "Students",
      questions: [
        {
          id: 3,
          question: "How do I add a new student?",
          answer: `
            <p>To add a new student:</p>
            <ol class="list-decimal pl-5 space-y-2 mt-2">
              <li>Go to the Students section in the main menu</li>
              <li>Click the "Add Student" button</li>
              <li>Fill out the admission form with student details</li>
              <li>Upload a photo if available</li>
              <li>Click "Save Student" to complete the process</li>
            </ol>
            <p class="mt-3">The student will now appear in your student listings and can be assigned to classes.</p>
          `
        },
        {
          id: 4,
          question: "How do family relationships work?",
          answer: `
            <p>Family relationships help organize students from the same family:</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
              <li>When adding siblings, link them to the same family</li>
              <li>This enables bulk fee management for families</li>
              <li>Family information appears in student details</li>
              <li>Parents can be designated as family heads</li>
            </ul>
            <p class="mt-3"><strong>Tip:</strong> This feature is especially useful for fee collection in traditional schools.</p>
          `
        }
      ]
    },
    {
      category: "Fees & Payments",
      questions: [
        {
          id: 5,
          question: "How do I generate fee challans?",
          answer: `
            <p>For traditional schools, generating fee challans:</p>
            <ol class="list-decimal pl-5 space-y-2 mt-2">
              <li>Go to the Fees section</li>
              <li>Select individual students or use bulk generation</li>
              <li>Enter challan details (month, amount, due date)</li>
              <li>Review and generate the challans</li>
              <li>Print or export as needed</li>
            </ol>
            <p class="mt-3"><strong>Note:</strong> This feature is only available for traditional schools. NGO schools will not see this section.</p>
          `
        },
        {
          id: 6,
          question: "What payment methods are supported?",
          answer: `
            <p>The system supports multiple payment methods:</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Cash</strong> - Traditional cash payments</li>
              <li><strong>Bank Transfer</strong> - Direct bank transfers</li>
              <li><strong>EasyPaisa</strong> - Mobile wallet payments</li>
              <li><strong>JazzCash</strong> - Mobile wallet payments</li>
            </ul>
            <p class="mt-3">When processing payments, select the appropriate method and record payment details for accurate tracking.</p>
          `
        }
      ]
    },
    {
      category: "Expenses",
      questions: [
        {
          id: 7,
          question: "How do I add expense categories?",
          answer: `
            <p>To create custom expense categories:</p>
            <ol class="list-decimal pl-5 space-y-2 mt-2">
              <li>Go to the Expenses section</li>
              <li>Click "Add Category" button</li>
              <li>Enter a name for your new category</li>
              <li>Use this category when adding new expenses</li>
            </ol>
            <p class="mt-3">Common categories include: Stationary, Utilities, Maintenance, Transportation, and Supplies.</p>
          `
        },
        {
          id: 8,
          question: "Are staff salaries included in expenses?",
          answer: `
            <p>No, staff salaries are managed separately:</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
              <li>Staff salaries are calculated automatically in the Staff section</li>
              <li>They are excluded from manual expense tracking to avoid duplication</li>
              <li>Salary expenses appear in financial reports automatically</li>
              <li>Use the Staff section for salary processing and advances</li>
            </ul>
            <p class="mt-3"><strong>Important:</strong> Only record non-salary expenses in the Expenses section.</p>
          `
        }
      ]
    },
    {
      category: "Reporting",
      questions: [
        {
          id: 9,
          question: "How do I export reports?",
          answer: `
            <p>Exporting data from any section:</p>
            <ol class="list-decimal pl-5 space-y-2 mt-2">
              <li>Apply any filters to narrow down your data</li>
              <li>Click the "Export CSV" or "Print" button</li>
              <li>For CSV exports, save the file to your computer</li>
              <li>For printing, use your browser's print dialog</li>
            </ol>
            <p class="mt-3">All reports maintain the same filtering applied in the interface for consistency.</p>
          `
        },
        {
          id: 10,
          question: "What financial reports are available?",
          answer: `
            <p>The Financial Reporting section provides:</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Income Tracking</strong> - Fees collected or subsidies received</li>
              <li><strong>Expense Analysis</strong> - Category-wise expenditure breakdown</li>
              <li><strong>Net Balance</strong> - Profit/loss calculations</li>
              <li><strong>Historical Trends</strong> - Income and expense patterns over time</li>
            </ul>
            <p class="mt-3">All reports can be filtered by date range and exported for further analysis.</p>
          `
        }
      ]
    }
  ];

  // Filter FAQ data based on search term
  const filteredFaqData = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleQuestion = (id) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaQuestionCircle className="text-white text-xl mr-3" />
              <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-blue-200" />
              </div>
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-blue-300 rounded-lg bg-blue-500 bg-opacity-20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow p-6">
          {filteredFaqData.length === 0 ? (
            <div className="text-center py-12">
              <FaSearch className="mx-auto text-gray-400 text-2xl mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No FAQs found</h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredFaqData.map((category) => (
                <div key={category.category}>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.questions.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleQuestion(faq.id)}
                          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          {openQuestion === faq.id ? (
                            <FaChevronUp className="text-gray-500" />
                          ) : (
                            <FaChevronDown className="text-gray-500" />
                          )}
                        </button>
                        {openQuestion === faq.id && (
                          <div 
                            className="px-4 py-3 bg-white prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close FAQ
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqSection;