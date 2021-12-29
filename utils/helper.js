exports.getAmountNofication = (amount) => {
  if (amount > 99) {
    return (99 + "+");
  } else {
    return amount;
  }
};
