export const  calculateCreditScore = (pastLoansPaidOnTime: number, numberOfLoansTaken: number, loanActivityInCurrentYear: number): number =>{
    let creditScore = 0;

    if (pastLoansPaidOnTime > 20 && numberOfLoansTaken > 0 && loanActivityInCurrentYear > 2) {
        creditScore = 100;
    } else if (pastLoansPaidOnTime > 0 && numberOfLoansTaken > 0 && loanActivityInCurrentYear > 1 ) {
        creditScore = 80;
    } else if (pastLoansPaidOnTime > 0) {
        creditScore = 50;
    } else {
        creditScore = 20;
    }

    return creditScore;
}