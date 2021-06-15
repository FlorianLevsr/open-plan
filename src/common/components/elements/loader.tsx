import { ReactNode, useContext } from "react";
import { FC } from "react";
import { AllTasksContext } from '../../context/AllTasksContext';

type LoaderProps = {
  children?: ReactNode
}

const Loader: FC<LoaderProps> = ({ children }) => {

  const { loading } = useContext(AllTasksContext);

  return (
    <>
      { loading ? <div>Loading...</div>: children }

    </>
  );

}

export default Loader;