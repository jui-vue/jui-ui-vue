// dateFormat은 jui-core-ts(원본 jui-core의 util.base.dateFormat 그대로 포팅됨)로 옮겨감 -
// Datepicker.vue에서 `import { dateFormat } from "jui-core-ts"`로 가져다 쓴다.
// getStartDate/getLastDate는 원본 jui-core에 없는, 이 캘린더 컴포넌트 전용 헬퍼라 그대로 둔다.
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
