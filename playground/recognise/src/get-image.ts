import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"
import { S3Event } from "aws-lambda"
import { Readable } from "stream"

const s3Client = new S3Client({ region: "eu-west-1" })
const sqsClient = new SQSClient({ region: "eu-west-1" })

export const handler = async (event: S3Event) => {
  const s3Record = event.Records[0].s3

  if (!s3Record) {
    console.log("No S3 record found in the event.")
    return
  }

  const objectKey = s3Record.object.key

  try {
    const processingItem = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: objectKey,
      })
    )

    const processingItemBody = await streamToBuffer(processingItem.Body as Readable)

    const command = new SendMessageCommand({
      QueueUrl: process.env.PROCESSING_QUEUE_URL,
      MessageBody: processingItemBody.toString("utf-8"),
    })

    const result = await sqsClient.send(command)
    console.log(result)
  } catch (error) {
    console.error("Error fetching and processing the S3 object:", error)
  }
}

async function streamToBuffer(stream: Readable) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on("data", (chunk: Buffer) => chunks.push(chunk))
    stream.on("end", () => resolve(Buffer.concat(chunks)))
    stream.on("error", reject)
  })
}
