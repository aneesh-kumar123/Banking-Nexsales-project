const badRequest = require("../errors/badRequest.js");
const validateFirstName = (firstName) => {
  if (firstName == "" || !firstName)
    throw new badRequest("firstName is not valid");
  if (typeof firstName != "string")
    throw new badRequest(" firstName type is not string");
};
const validateLastName = (lastName) => {
  if (lastName == "" || !lastName) throw new badRequest("lastname is not valid");
  if (typeof lastName != "string")
    throw new badRequest("lastName type is not string");
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    throw new badRequest("Email is invalid or empty.");
  }
};

// Validate date of birth (dob)
const validateDob = (dob) => {
  console.log("dob is ", dob);
  if (!dob) {
    throw new badRequest("Date of birth is required.");
  }
  const parsedDate = new Date(dob);
  if (isNaN(parsedDate.getTime())) {
    throw new badRequest("Date of birth is invalid.");
  }
  const today = new Date();
  const age = today.getFullYear() - parsedDate.getFullYear();
  const monthDiff = today.getMonth() - parsedDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) {
    age--; // Adjust age if birthday hasn't occurred yet this year
  }
  if (age < 18) {
    throw new badRequest("User must be at least 18 years old.");
  }
};

const validateAge = (age) => {
  console.log("the age we got here",age)
  console.log("age type",typeof age)
  if (typeof age != "number") throw new badRequest("age is not valid");
  if (!age) throw new badRequest("age is empty");

  if (age <= 18)
    throw new badRequest("age should be greater than 18");
};

const validateParameter = (parameter) =>{
  if ( typeof parameter !== "string" ) {
    console.log("the here is",parameter)
    throw new badRequest("Parameter is invalid or empty.");
  }
}


const validateBankName = (bankName) => {
  if (!bankName || typeof bankName !== "string" || bankName.trim() === "") {
    throw new badRequest("Bank name is invalid or empty.");
  }
};

const validateAbbreviation = (abbreviation) => {
  if (!abbreviation || typeof abbreviation !== "string" || abbreviation.trim() === "") {
    throw new badRequest("Bank abbreviation is invalid or empty.");
  }
  if (abbreviation.length > 5) {
    throw new badRequest("Abbreviation should not exceed 5 characters.");
  }
};

const validateAccountType = (accountType) => {
  const validTypes = ["savings", "current","fixed"];
  if (!validTypes.includes(accountType)) {
    throw new badRequest("Invalid account type.");
  }
};

const validateAmount = (amount) => {
  if (typeof amount !== "number" || amount <= 0) {
    throw new badRequest("Amount must be a positive number.");
  }
};


module.exports = { validateAge, validateFirstName, validateLastName ,validateEmail,validateDob, validateBankName,validateAbbreviation, validateAccountType,validateAmount,validateParameter};