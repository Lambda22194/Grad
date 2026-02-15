function computeRecommendations(studentTags, jobs) {
  const set = new Set(studentTags.map(t => t.toLowerCase().trim()).filter(Boolean));
  return jobs
    .map(j => {
      const tags = (j.tags || "").split(",").map(x => x.toLowerCase().trim()).filter(Boolean);
      let overlap = 0;
      for (const t of tags) if (set.has(t)) overlap++;
      return { ...j, overlap };
    })
    .sort((a, b) => (b.overlap - a.overlap) || (new Date(b.created_at) - new Date(a.created_at)));
}

module.exports = { computeRecommendations };
