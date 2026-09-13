function shareFor(exp, memberId, participants) {
  if (exp.splitType === 'custom' && exp.customSplit) return exp.customSplit[memberId] || 0;
  return exp.amount / participants.length;
}

function participantsFor(exp, members) {
  if (exp.splitType === 'custom' && exp.customSplit) return Object.keys(exp.customSplit);
  return exp.splitWith?.length ? exp.splitWith : members.map((m) => m.id);
}

// Each member's overall net position across the whole group — positive
// means the group owes them, negative means they owe the group. This is
// the input a debt-simplification needs: it has to see everyone's balance
// at once to find a shortcut (e.g. A owes B owes C -> A pays C directly),
// which a pairwise-with-you-only view structurally can't do.
export function computeGroupBalances(expenses, members) {
  const net = {};
  members.forEach((m) => {
    net[m.id] = 0;
  });

  for (const exp of expenses) {
    if (exp.isSettlement) {
      if (exp.paidBy in net) net[exp.paidBy] += exp.amount;
      if (exp.settledWith in net) net[exp.settledWith] -= exp.amount;
      continue;
    }

    const participants = participantsFor(exp, members);
    for (const id of participants) {
      if (id in net) net[id] -= shareFor(exp, id, participants);
    }
    if (exp.paidBy in net) net[exp.paidBy] += exp.amount;
  }

  return net;
}

// Classic greedy min-cash-flow: repeatedly match the biggest creditor with
// the biggest debtor for whatever they have in common, until everyone's
// settled. Not provably optimal in every possible case, but it's the same
// heuristic Splitwise's own "simplify debts" uses, and it reliably beats a
// naive pairwise settle-up in transfer count whenever debts chain through
// a third person.
export function simplifyDebts(net) {
  const round = (n) => Math.round(n * 100) / 100;
  const creditors = [];
  const debtors = [];
  for (const [id, amount] of Object.entries(net)) {
    const rounded = round(amount);
    if (rounded > 0.01) creditors.push({ id, amount: rounded });
    else if (rounded < -0.01) debtors.push({ id, amount: -rounded });
  }
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = round(Math.min(debtor.amount, creditor.amount));
    if (amount > 0.01) transfers.push({ from: debtor.id, to: creditor.id, amount });
    debtor.amount = round(debtor.amount - amount);
    creditor.amount = round(creditor.amount - amount);
    if (debtor.amount <= 0.01) i++;
    if (creditor.amount <= 0.01) j++;
  }
  return transfers;
}

// The group-wide simplification, sliced down to what "you" actually need
// to pay or collect — same shape (`youOwe`/`owedToYou`) the old pairwise
// calculation returned, so the screens consuming it don't need to change.
export function computeSimplifiedBalances(expenses, members, youId) {
  const net = computeGroupBalances(expenses, members);
  const transfers = simplifyDebts(net);

  const youOwe = transfers
    .filter((t) => t.from === youId)
    .map((t) => ({ to: t.to, amount: t.amount }))
    .sort((a, b) => b.amount - a.amount);
  const owedToYou = transfers
    .filter((t) => t.to === youId)
    .map((t) => ({ from: t.from, amount: t.amount }))
    .sort((a, b) => b.amount - a.amount);

  return { net, transfers, youOwe, owedToYou };
}

export function totalsByCategory(expenses) {
  const totals = {};
  let total = 0;
  for (const exp of expenses) {
    totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    total += exp.amount;
  }
  return { totals, total };
}

// "Your Spend" isn't the full amount of every expense you happened to be
// part of — it's your own share of each one (what you actually owe/paid
// toward it), which is what makes it read as smaller than the group total.
export function yourShareByCategory(expenses, members, youId) {
  const totals = {};
  let total = 0;
  for (const exp of expenses) {
    if (exp.isSettlement) continue;
    const participants = participantsFor(exp, members);
    if (!participants.includes(youId)) continue;
    const share = shareFor(exp, youId, participants);
    totals[exp.category] = (totals[exp.category] || 0) + share;
    total += share;
  }
  return { totals, total };
}

export function formatMoney(amount) {
  const rounded = Math.round(amount);
  return `$${rounded.toLocaleString('en-US')}`;
}
