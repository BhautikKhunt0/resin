import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TermsOfService() {
  const { data: termsContent, isLoading } = useQuery({
    queryKey: ["/api/settings/terms_of_service"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const defaultContent = `
# Terms of Service

## Welcome to ModernShop

These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our service, you agree to be bound by these Terms.

## Use of Service

You may use our service for lawful purposes only. You agree not to use the service:
- In any way that violates any applicable federal, state, local, or international law or regulation
- To transmit, or procure the sending of, any advertising or promotional material, which is not solicited
- To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity

## Product Information

We strive to provide accurate product descriptions and pricing information. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.

## Orders and Payment

- All orders are subject to acceptance and availability
- We reserve the right to refuse or cancel any order
- Payment must be made at the time of purchase
- Prices are subject to change without notice

## Shipping and Delivery

- We will make every effort to deliver products within the estimated timeframe
- Delivery times are estimates and not guaranteed
- Risk of loss and title for products pass to you upon delivery

## Returns and Refunds

Please refer to our Return Policy for detailed information about returns, exchanges, and refunds.

## Privacy

Your privacy is important to us. Please refer to our Privacy Policy for information about how we collect, use, and protect your personal information.

## Limitation of Liability

In no event shall ModernShop be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.

## Changes to Terms

We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.

## Contact Information

If you have any questions about these Terms of Service, please contact us at admin@modernshop.com.

*Last updated: ${new Date().toLocaleDateString()}*
  `.trim();

  const content = (termsContent as any)?.value || defaultContent;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray max-w-none">
              <div 
                className="whitespace-pre-wrap text-gray-700 leading-relaxed"
                style={{ 
                  lineHeight: '1.6',
                  fontSize: '16px'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: content.replace(/\n/g, '<br />').replace(/# (.*?)<br \/>/g, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h1>').replace(/## (.*?)<br \/>/g, '<h2 class="text-xl font-semibold mt-6 mb-3 text-gray-800">$1</h2>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}