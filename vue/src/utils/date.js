// 원본이 쓰는 juijs 코어의 _.dateFormat(date, format)을 같은 토큰(yyyy/MM/dd)만
// 지원하는 선에서 재구현했다(이 리포에 vendoring 안 됨).
export function dateFormat(date, format) {
    if (!date) return ""
    const yyyy = String(date.getFullYear())
    const MM = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")
    return format.replace(/yyyy/g, yyyy).replace(/MM/g, MM).replace(/dd/g, dd)
}

export function getStartDate(date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

export function getLastDate(year, month) {
    if (month === 2) {
        return year % 100 !== 0 && (year % 4 === 0 || year % 400 === 0) ? 29 : 28
    }
    const months = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return months[month - 1]
}
