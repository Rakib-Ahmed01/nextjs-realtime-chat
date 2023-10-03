import Button from '@/components/ui/Button';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log({ session: session });
  return (
    <div>
      <Button
        className="text-white"
        isLoading={true}
        variant="default"
        size="lg"
      >
        Click Me
      </Button>
    </div>
  );
}
