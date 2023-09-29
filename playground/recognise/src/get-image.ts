import { S3NotificationEvent } from "aws-lambda"

export const handler = async (event: S3NotificationEvent) => {
  console.log(event)
}
