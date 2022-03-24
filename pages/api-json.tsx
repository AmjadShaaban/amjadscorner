import type { NextPage } from 'next';
import { useMemo } from 'react';
import { useGetProjects } from '../utils/hooks/api-hooks';

const APIJSON: NextPage = () => {
  const { data: projectsResponse } = useGetProjects();

  const data = useMemo(
    () => projectsResponse?.projects ?? [],
    [projectsResponse?.projects]
  );
  return <pre>{JSON.stringify({ projects: data }, null, 4)}</pre>;
};

export default APIJSON;
