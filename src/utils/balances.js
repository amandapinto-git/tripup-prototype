function shareFor(exp, memberId, participants) {
  if (exp.splitType === 'custom' && exp.customSplit) return exp.customSplit[memberId] || 0;
  return exp.amount / participants.length;
}

function participantsFor(exp, members) {
  if (exp.splitType === 'custom' && exp.customSplit) return Object.keys(exp.customSplit);
  return exp.splitWith?.length ? exp.splitWith : members.map((m) => m.id);
}

// Splitwise-style pairwise balances: for each other member, how much they
// owe you minus how much you owe them, based only on expenses you both
// shared. Unlike a global debt-simplification, this lets you simultaneously
// owe one friend while another owes you — because those are two separate
// relationships, not one net position.
export function computePairwiseBalances(expenses, members, youId) {
  const net = {};
  members.forEach((m) => {
    if (m.id !== youId) net[m.id] = 0;
  });

  for (const exp of expenses) {
    if (exp.isSettlement) {
      if (exp.settledWith in net) net[exp.settledWith] += exp.amount;
      continue;
    }

    const participants = exp.splitType === 'custom' && exp.customSplit
      ? Object.keys(exp.customSplit)
      : exp.splitWith?.length
        ? exp.splitWith
        : members.map((m) => m.id);

    if (exp.paidBy === youId) {
      for (const id of participants) {
        if (id !== youId && id in net) net[id] += shareFor(exp, id, participants);
      }
    } else if (participants.includes(youId) && exp.paidBy in net) {
      net[exp.paidBy] -= shareFor(exp, youId, participants);
    }
  }

  const youOwe = [];
  const owedToYou = [];
  for (const [id, amount] of Object.entries(net)) {
    const rounded = Math.round(amount * 100) / 100;
    if (rounded < -0.01) youOwe.push({ to: id, amount: -rounded });
    else if (rounded > 0.01) owedToYou.push({ from: id, amount: rounded });
  }
  youOwe.sort((a, b) => b.amount - a.amount);
  owedToYou.sort((a, b) => b.amount - a.amount);

  return { net, youOwe, owedToYou };
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
