const input = document.getElementById("input");

function check() {
    const value = input.value;
    const reverse = reverseString(value);

    if (value === reverse)
        alert("It is palindrome!");
    else
        alert("Not today!");
}

function reverseString(str) {
    return reverse = str.split("").reverse().join("");
}