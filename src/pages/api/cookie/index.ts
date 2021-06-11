import { NextApiRequest, NextApiResponse } from 'next'
import Cookies from 'universal-cookie';

const cookieSetter = (req: NextApiRequest, res: NextApiResponse) => {

  const { token } = req.body;
  console.log('headers: ', req.headers.cookie)

  console.log('login token: ', token)

  const cookies = new Cookies();
  cookies.set('fauna-token', token)

  res.status(200).json(`Token has been set: ${token}`);

}

export default cookieSetter