import * as React from 'react';
import { ClassDataPropsWithId } from '../../class/types';
import { useLazyGetClassesQuery } from '../../class/api';

export const useClasses = () => {
  const [classes, setClasses] = React.useState<ClassDataPropsWithId[]>([]);
  const [getClasses] = useLazyGetClassesQuery();

  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        const result = await getClasses().unwrap();
        if (result.classes) {
          setClasses(result.classes);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchClasses();
  }, [getClasses]);

  return classes;
};
