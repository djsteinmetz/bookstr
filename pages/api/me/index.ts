import { NextApiHandler } from 'next'
import { query } from '../../../lib/db'
import { parse } from "cookie";
import { verify } from 'jsonwebtoken'

const handler: NextApiHandler = async (req, res) => {
  // Get token from cookies
  const cookie = parse(req.headers.cookie)['bookstr.access_token']
  try {
    if (!cookie) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const decoded = verify(cookie, process.env.NEXT_PUBLIC_API_SECRET);
    const results = await query(
      `
      SELECT ID, Active, FullName, Email, Verified
      FROM users
      WHERE ID = ?
    `,
      decoded.usr
    )

    // Not Found Exception
    if (res.statusCode === 200 && !results[0]) {
      return res.status(404).json({"Object Not Found": `${decoded.usr}`})
    }

    return res.json(results[0])
  } catch (e) {
    res.status(401).json({ message: 'Unauthorized' })
  }
}

export default handler