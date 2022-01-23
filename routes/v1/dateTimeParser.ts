export default class DateTimeParser {
    parseDateTimeData(data: number[]): string[] {
        const parsedData: string[] = [];
        for (let number of data) {
            if (number < 10) {
                let tempNumber = '0' + number;
                parsedData.push(tempNumber);
                continue;
            }
            parsedData.push(number.toString());
        }
        return parsedData;
    }

    createDateString(dateObject: Date): string {
        const year = dateObject.getFullYear();
        const month = dateObject.getMonth() + 1;
        const date = dateObject.getDate();
        const dateData: number[] = [month, date];
        const parsedData = this.parseDateTimeData(dateData);
        const dateString = year + '-' + parsedData[0] + '-' + parsedData[1];
        return dateString;
    }

    createTimeString(dateObject: Date): string {
        const hour = dateObject.getHours();
        const min = dateObject.getMinutes();
        const sec = dateObject.getSeconds();
        const dateData: number[] = [hour, min, sec];
        const parsedData = this.parseDateTimeData(dateData);
        const timeString =
            parsedData[0] + ':' + parsedData[1] + ':' + parsedData[2];
        return timeString;
    }

    public convertTimeFromUnix(UNIXTimestamp: any): string {
        let dateTime: string;
        const dateObject = new Date(UNIXTimestamp * 1000);
        const date = this.createDateString(dateObject);
        const time = this.createTimeString(dateObject);
        dateTime = date + 'T' + time;
        return dateTime;
    }
}
