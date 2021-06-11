import React, { FC, ReactNode, useContext } from 'react'
import Link from 'next/link'
import { AuthContext } from '../../context/AuthContext'

const AuthBar: FC = ({ }) => {
  const { currentUser, states, actions } = useContext(AuthContext);

  if (states.loading) {
    return <div>Loading...</div>;
  }
  
  if (currentUser) {
    return (
      <div>
        <div>Bienvenue {currentUser.username}</div>
        <button onClick={() => actions.logout()}>Logout</button>
      </div>
    );
  }
  
  return (
    <Link href="/login">
      <a>Login</a>
    </Link>
  );
}

type Props = {
  children?: ReactNode
}

const Layout = ({ children }: Props) => {

  const { currentUser } = useContext(AuthContext);

  return (
    <div>
      <header>
        <nav>
          <Link href="/">
            <a>Home</a>
          </Link>
          {
            currentUser &&
            <Link href="/tasks">
              <a>Tasks list</a>
            </Link>
          }
          <AuthBar />
        </nav>
      </header>
      <main>
        {children}
      </main>
      <footer>
        <hr />
        <span>I'm here to stay (Footer)</span>
      </footer>
    </div>
  )
}





export default Layout