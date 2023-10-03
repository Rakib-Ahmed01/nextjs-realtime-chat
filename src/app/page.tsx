import Button from '@/components/ui/Button';

export default async function Home() {
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
