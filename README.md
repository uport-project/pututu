# uPort :: Pututu
uPort Push Notification Service

![Pututu](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Chasqui3.JPG/180px-Chasqui3.JPG)

[Diagrams](./diagrams/README.md)

## Description
Pututu is a server that allows dApps and servers to send push notification messages to any uPort Mobile App

## API Description
### Push notifications

Pututu can parse and send uport messages to any registered uport mobile app.
The consumer of the API needs to present a "notification token" (JWT) issued
by the uport user.

The format of the payload of the "notification token" is

```
{
 aud: <uportId of the uport user>,
 type: 'notifications',
 value: <registered Arn for the device>,
 iss: <uportId of the uport user>,
 iat: <issue date>,
 exp: <expiration date>
}
```

### Endpoint

`POST /api/v1/sns`

### Headers
```
Authorization: Bearer <notification token>
```
### Body
```
{
  url: <uport url>,
  message: <message>
}
```

#### Response

| Status |     Message    |                               |
|:------:|----------------|-------------------------------|
| 200    | Ok             | Message Send                   |
| 400    | Fail           | endpointArn not supported     |
| 400    | Fail           | token not signed by endpointArn user |
| 403    | Forbidden      | JWT token missing or invalid  |
| 500    | Internal Error | Internal error                |

#### Response data
```
{
  status: 'success',
  message: <messageId>
}
```
### Sequence Diagram

![Sns Seq](./diagrams/img/api-v1.sns.seq.png)

### Endpoint

`POST /api/v2/sns`

### Headers
```
Authorization: Bearer <jwt token>
```
### Body
```
{
  message: <encrypted message>
}
```

#### Response

| Status |     Message    |                               |
|:------:|----------------|-------------------------------|
| 200    | Ok             | Message Send                   |
| 400    | Fail           | endpointArn not supported     |
| 400    | Fail           | token not signed by endpointArn user |
| 403    | Forbidden      | JWT token missing or invalid  |
| 500    | Internal Error | Internal error                |

#### Response data
```
{
  status: 'success',
  message: <messageId>
}
```
### Sequence Diagram

![Sns Seq](./diagrams/img/api-v2.sns.seq.png)
