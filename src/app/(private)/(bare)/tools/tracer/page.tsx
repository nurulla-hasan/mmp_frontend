import { Suspense } from 'react';
import TracerClientWrapper from './tracer-client-wrapper';

export const metadata = {
  title: 'ডিজিটাল ম্যাপ ট্রেসিং | MMP',
  description: 'পুরানো মৌজা ম্যাপের উপর C.S ও B.S দাগের সীমানা ট্রেস করে পরিষ্কার ভেক্টর ম্যাপ তৈরি করুন।',
};

export default function TracerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <TracerClientWrapper />
    </Suspense>
  );
}
