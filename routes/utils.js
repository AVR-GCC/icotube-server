const wait = (miliseconds) => {
    return new Promise((resolve) => {
        setTimeout(resolve, miliseconds);
    });
}

module.exports = {
    wait
}