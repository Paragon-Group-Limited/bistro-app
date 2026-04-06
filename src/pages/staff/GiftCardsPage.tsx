import { useState, useEffect } from 'react';
import { Gift, Plus, CreditCard, ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { StaffLayout } from '@/components/staff/StaffLayout';
import {
  getGiftCards,
  addGiftCard,
  editGiftCard,
  getGiftCardTransactions,
  topupGiftCard,
} from '@/data/api';
import type { GiftCard, GiftCardTransaction } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Tab = 'cards' | 'transactions';

function statusBadgeVariant(
  status: GiftCard['status'],
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'active':
      return 'default';
    case 'used':
      return 'secondary';
    case 'inactive':
      return 'outline';
    case 'expired':
      return 'destructive';
  }
}

function statusLabel(status: GiftCard['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function txnTypeBadgeVariant(
  type: GiftCardTransaction['type'],
): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'issue':
      return 'default';
    case 'redeem':
      return 'secondary';
    case 'topup':
      return 'outline';
  }
}

function txnTypeLabel(type: GiftCardTransaction['type']): string {
  switch (type) {
    case 'issue':
      return 'Issue';
    case 'redeem':
      return 'Redeem';
    case 'topup':
      return 'Top Up';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return `\u09F3${amount.toLocaleString()}`;
}

function generateCardNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `GC-${year}-${seq}`;
}

export function GiftCardsPage() {
  const [tab, setTab] = useState<Tab>('cards');
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [transactions, setTransactions] = useState<GiftCardTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Issue dialog state
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueBalance, setIssueBalance] = useState('');
  const [issueCustomerName, setIssueCustomerName] = useState('');
  const [issueCustomerPhone, setIssueCustomerPhone] = useState('');
  const [issueExpiresAt, setIssueExpiresAt] = useState('');

  // Top-up dialog state
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupCard, setTopupCard] = useState<GiftCard | null>(null);
  const [topupAmount, setTopupAmount] = useState('');

  async function loadCards() {
    setLoading(true);
    const data = await getGiftCards();
    setCards(data);
    setLoading(false);
  }

  async function loadTransactions() {
    setLoading(true);
    const [txnData, cardData] = await Promise.all([
      getGiftCardTransactions(),
      getGiftCards(),
    ]);
    setTransactions(txnData);
    setCards(cardData);
    setLoading(false);
  }

  useEffect(() => {
    if (tab === 'cards') {
      loadCards();
    } else {
      loadTransactions();
    }
  }, [tab]);

  // ---- Issue Gift Card ----
  function resetIssueForm() {
    setIssueBalance('');
    setIssueCustomerName('');
    setIssueCustomerPhone('');
    setIssueExpiresAt('');
  }

  async function handleIssue() {
    if (!issueBalance || Number(issueBalance) <= 0) {
      toast.error('Please enter a valid initial balance');
      return;
    }

    await addGiftCard({
      cardNumber: generateCardNumber(),
      initialBalance: Number(issueBalance),
      currentBalance: Number(issueBalance),
      status: 'active',
      customerName: issueCustomerName.trim() || undefined,
      expiresAt: issueExpiresAt || undefined,
      issuedBy: 'Admin',
    });
    toast.success('Gift card issued');
    setIssueOpen(false);
    resetIssueForm();
    loadCards();
  }

  // ---- Top Up ----
  function openTopup(card: GiftCard) {
    setTopupCard(card);
    setTopupAmount('');
    setTopupOpen(true);
  }

  async function handleTopup() {
    if (!topupCard || !topupAmount || Number(topupAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    await topupGiftCard(topupCard.id, Number(topupAmount), 'Admin');
    toast.success(`Topped up ${formatCurrency(Number(topupAmount))}`);
    setTopupOpen(false);
    loadCards();
  }

  // ---- Toggle active/inactive ----
  async function handleToggleStatus(card: GiftCard) {
    const newStatus = card.status === 'active' ? 'inactive' : 'active';
    await editGiftCard(card.id, { status: newStatus });
    toast.success(
      newStatus === 'active' ? 'Gift card activated' : 'Gift card deactivated',
    );
    loadCards();
  }

  // Sort cards: active first, then by creation date desc
  const sortedCards = [...cards].sort((a, b) => {
    const order = { active: 0, inactive: 1, used: 2, expired: 3 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <StaffLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-5 h-5" />
            <h2 className="text-xl font-bold">
              Gift Cards{' '}
              <span className="text-base font-normal text-muted-foreground">
                ({cards.length})
              </span>
            </h2>
          </div>
          {tab === 'cards' && (
            <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    resetIssueForm();
                    setIssueOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Issue Gift Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Issue Gift Card</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="gc-balance">Initial Balance *</Label>
                    <Input
                      id="gc-balance"
                      type="number"
                      value={issueBalance}
                      onChange={(e) => setIssueBalance(e.target.value)}
                      placeholder="e.g. 2000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gc-customer-name">Customer Name</Label>
                    <Input
                      id="gc-customer-name"
                      value={issueCustomerName}
                      onChange={(e) => setIssueCustomerName(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gc-customer-phone">Customer Phone</Label>
                    <Input
                      id="gc-customer-phone"
                      value={issueCustomerPhone}
                      onChange={(e) => setIssueCustomerPhone(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gc-expires">Expires Date</Label>
                    <Input
                      id="gc-expires"
                      type="date"
                      value={issueExpiresAt}
                      onChange={(e) => setIssueExpiresAt(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setIssueOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleIssue}>Issue Card</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Issue, manage, and track gift card balances
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6 border-b">
        <button
          onClick={() => setTab('cards')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'cards'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CreditCard className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          All Cards
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'transactions'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          Transactions
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : tab === 'cards' ? (
        /* =================== ALL CARDS TAB =================== */
        sortedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Gift className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">No gift cards yet. Issue your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCards.map((card) => {
              const balancePct =
                card.initialBalance > 0
                  ? Math.round((card.currentBalance / card.initialBalance) * 100)
                  : 0;
              const dimmed =
                card.status === 'inactive' ||
                card.status === 'expired' ||
                card.status === 'used';

              return (
                <Card key={card.id} className={dimmed ? 'opacity-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Top row: card number + status + customer */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <code className="text-base font-bold font-mono tracking-wide">
                            {card.cardNumber}
                          </code>
                          <Badge variant={statusBadgeVariant(card.status)}>
                            {statusLabel(card.status)}
                          </Badge>
                          {card.customerName && (
                            <span className="text-sm text-muted-foreground">
                              {card.customerName}
                            </span>
                          )}
                        </div>

                        {/* Balance display */}
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold">
                              {formatCurrency(card.currentBalance)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / {formatCurrency(card.initialBalance)}
                            </span>
                          </div>
                          {/* Progress bar (div-based) */}
                          <div className="h-2 w-full max-w-xs rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${balancePct}%` }}
                            />
                          </div>
                        </div>

                        {/* Expires */}
                        {card.expiresAt && (
                          <div className="text-xs text-muted-foreground">
                            Expires: {formatDate(card.expiresAt)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {card.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => openTopup(card)}
                          >
                            <ArrowUpCircle className="w-4 h-4" />
                            Top Up
                          </Button>
                        )}
                        <Button
                          variant={card.status === 'active' ? 'secondary' : 'default'}
                          size="sm"
                          onClick={() => handleToggleStatus(card)}
                          disabled={
                            card.status === 'expired' || card.status === 'used'
                          }
                        >
                          {card.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Top-up dialog */}
            <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Top Up {topupCard?.cardNumber}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="topup-amount">Amount</Label>
                    <Input
                      id="topup-amount"
                      type="number"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      placeholder="e.g. 500"
                    />
                  </div>
                  {topupCard && (
                    <p className="text-sm text-muted-foreground">
                      Current balance: {formatCurrency(topupCard.currentBalance)}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setTopupOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleTopup}>Top Up</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )
      ) : (
        /* =================== TRANSACTIONS TAB =================== */
        transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <CreditCard className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">No transactions yet.</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Card Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => {
                    const card = cards.find((c) => c.id === txn.giftCardId);
                    return (
                      <TableRow key={txn.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(txn.createdAt)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {card?.cardNumber ?? txn.giftCardId}
                        </TableCell>
                        <TableCell>
                          <Badge variant={txnTypeBadgeVariant(txn.type)}>
                            {txnTypeLabel(txn.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatCurrency(txn.amount)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatCurrency(txn.balanceAfter)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {txn.note || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      )}
    </StaffLayout>
  );
}
