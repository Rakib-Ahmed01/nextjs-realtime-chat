import Button from '@/components/ui/Button';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log({ session: session });
  console.log(await db.ping());
  return (
    <div>
      <Button className="text-white" variant="default" size="lg">
        Click Me
      </Button>
    </div>
  );
}
