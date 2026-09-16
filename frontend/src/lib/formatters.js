export function formatCurrency(value) {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
    }).format(Number(value) || 0);
}

export function formatCurrentDate() {
    return new Intl.DateTimeFormat("en-LK", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date());
}
