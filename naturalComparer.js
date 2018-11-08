module.exports.compare =
    function (a, b)
    {
        // Counting the nesting levels
        let aLevel = a.replace(/[?\/]/g, "").length
        let bLevel = b.replace(/[?\/]/g, "").length

        if (aLevel < bLevel) return -1;
        if (aLevel > bLevel) return 1;
        return a.localeCompare(b)
    }