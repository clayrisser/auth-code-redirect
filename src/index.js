import Err from 'err';
import bodyParser from 'body-parser';
import express from 'express';

const app = express();
const logger = console;
const { env } = process;
const options = {
  clientId: env.CLIENT_ID || '',
  clientSecret: env.CLIENT_SECRET || '',
  port: env.PORT || 3000,
  redirect: env.REDIRECT || '/test'
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) throw new Err("missing query param 'code'", 400);
    const token = Buffer.from(code).toString('base64');
    return res.redirect(302, `${options.redirect}?token=${token}`);
  } catch (err) {
    return next(err);
  }
});

app.get('/ping', async (req, res, next) => {
  try {
    return res.json({ status: 'alive' });
  } catch (err) {
    return next(err);
  }
});

app.get('/test', async (req, res, next) => {
  try {
    const { token = '' } = req.query;
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

app.listen(options.port, '0.0.0.0', () => {
  logger.info(`listening on port ${options.port}`);
});

app.use((err, req, res, _next) => {
  if (err.code && err.code < 500) {
    logger.warn(err.message);
    res.status(err.code);
  } else {
    logger.error(err);
    res.status(500);
  }
  return res.json({ message: err.message });
});
