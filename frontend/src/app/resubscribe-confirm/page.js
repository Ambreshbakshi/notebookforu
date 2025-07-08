import { Suspense } from 'react';
import ConfirmResubscribePage from './ConfirmResubscribeClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Loading...</div>}>
      <ConfirmResubscribePage />
    </Suspense>
  );
}
