import ContentGenerator from '@/components/dashboard/ContentGenerator';
import { getUserId } from '@/lib/auth';
import { getAccount } from '@/lib/data';

export default async function ContentPage() {
  const { business } = await getAccount(await getUserId());
  return <ContentGenerator business={{ name: business.name, tone: business.tone }} />;
}
