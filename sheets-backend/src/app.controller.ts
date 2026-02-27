import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  redirect(@Res() res: Response): void {
    res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Redirecting...</title>
  <script>
    const url = new URL(window.location.href);
    url.port = '';
    window.location.replace(url.href);
  </script>
</head>
<body>Redirecting to the application...</body>
</html>`);
  }
}
