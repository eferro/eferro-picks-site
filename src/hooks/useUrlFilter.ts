import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TalksFilter, type TalksFilterData } from '../utils/TalksFilter';
import { mergeParams } from '../utils/url';

export function useUrlFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = useMemo(
    () => TalksFilter.fromUrlParams(searchParams),
    [searchParams]
  );

  const updateFilter = (updates: TalksFilterData) => {
    const nextFilter = new TalksFilter({ ...filter, ...updates });
    const next = mergeParams(
      searchParams,
      new URLSearchParams(nextFilter.toParams())
    );
    setSearchParams(next);
  };

  return { filter, updateFilter, searchParams, setSearchParams };
}
