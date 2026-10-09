document.addEventListener('DOMContentLoaded', async () => {
    const loadingEl = document.getElementById('jays-loading');
    const resultEl = document.getElementById('jays-result');
    const errorEl = document.getElementById('jays-error');
    
    const answerEl = document.getElementById('jays-answer');
    const contextEl = document.getElementById('jays-context');
    const rankEl = document.getElementById('jays-rank');
    const gbEl = document.getElementById('jays-gb');
    const elimEl = document.getElementById('jays-elim');
    const momentumList = document.getElementById('momentum-list');
    
    const pbFill = document.getElementById('pb-fill');
    const pbText = document.getElementById('pb-text');

    try {
        // Fetch AL & NL Wild Card standings
        const res = await fetch('https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2026&standingsTypes=wildCard');
        if (!res.ok) throw new Error('API fetch failed');
        const data = await res.json();

        let jays = null;
        let clinched = false;
        
        let alWildCardLeaders = [];

        // Parse records
        for (const record of data.records) {
            // Find Blue Jays
            const teamData = record.teamRecords.find(t => t.team.id === 141 || t.team.name.includes("Blue Jays"));
            if (teamData) {
                jays = teamData;
                clinched = teamData.clinched;
            }
            
            // Collect AL Wild Card Leaders (League 103)
            if (record.standingsType === "wildCard" && record.league && record.league.id === 103) {
                alWildCardLeaders = record.teamRecords.filter(t => parseInt(t.wildCardRank) <= 3).sort((a,b) => parseInt(a.wildCardRank) - parseInt(b.wildCardRank));
            }
        }

        if (!jays) {
            // Gracefully handle if they are removed from the wild card standings (e.g. out of contention or leading division)
            jays = {
                clinched: false,
                wildCardRank: "N/A",
                wildCardEliminationNumber: "E",
                eliminationNumber: "E",
                wildCardGamesBack: "-",
                wins: 0,
                losses: 0,
            };
        }

        loadingEl.style.display = 'none';
        resultEl.style.display = 'block';

        const rank = parseInt(jays.wildCardRank) || 0;
        const isPostSeason = clinched || (rank > 0 && rank <= 3);

        if (isPostSeason) {
            answerEl.textContent = "YES";
            answerEl.style.color = "#10b981"; // emerald
            if (clinched) {
                contextEl.textContent = "They have officially clinched a spot!";
            } else {
                contextEl.textContent = "They are currently holding a Wild Card spot.";
            }
        } else {
            answerEl.textContent = "NO";
            answerEl.style.color = "#ef4444"; // red
            
            const elimWc = jays.wildCardEliminationNumber === "E" || jays.wildCardEliminationNumber === "-";
            const elimDiv = jays.eliminationNumber === "E" || jays.eliminationNumber === "-";
            
            if (elimWc && elimDiv) {
                contextEl.textContent = "They have been mathematically eliminated.";
            } else {
                const gb = jays.wildCardGamesBack;
                contextEl.textContent = `They are ${gb} games out of a Wild Card spot.`;
            }
        }

        rankEl.textContent = jays.wildCardRank || "N/A";
        gbEl.textContent = jays.wildCardGamesBack || "0.0";
        
        const elimNum = jays.wildCardEliminationNumber || "E";
        elimEl.textContent = elimNum;
        
        // Progress Bar Calculation
        if (elimNum === "E" || elimNum === "-") {
            pbFill.style.width = "100%";
            pbFill.style.background = "#ef4444";
            pbText.textContent = "Eliminated";
        } else if (clinched) {
            pbFill.style.width = "100%";
            pbFill.style.background = "#10b981";
            pbText.textContent = "Clinched!";
        } else {
            const eNum = parseInt(elimNum);
            let danger = ((162 - eNum) / 162) * 100;
            if (danger < 0) danger = 0;
            if (danger > 100) danger = 100;
            
            pbFill.style.width = `${danger}%`;
            pbText.textContent = `Tragic Number: ${eNum}`;
            
            if (eNum < 10) {
                pbFill.style.background = "#f97316"; // orange
            }
        }

        // Estimated Odds Calculation
        const oddsEl = document.getElementById('jays-odds');
        let odds = 0;
        const gamesPlayed = (jays.wins || 0) + (jays.losses || 0);
        const gamesRemaining = 162 - gamesPlayed;
        
        if (elimNum === "E" || elimNum === "-" || (jays.eliminationNumber === "E" && jays.wildCardEliminationNumber === "E")) {
            odds = 0;
        } else if (clinched) {
            odds = 100;
        } else if (isPostSeason) {
            // They are currently in a playoff spot
            odds = Math.min(99.9, 50 + (gamesPlayed / 162) * 45); 
        } else {
            const gb = parseFloat(jays.wildCardGamesBack) || 0;
            if (gamesRemaining <= 0 || gb > gamesRemaining) {
                odds = 0;
            } else {
                let estimatedOdds = 50 * Math.pow(0.7, gb * (30 / Math.max(1, gamesRemaining)));
                odds = Math.max(0.1, Math.min(49.9, estimatedOdds)); 
            }
        }
        
        oddsEl.textContent = odds === 100 || odds === 0 ? `${odds}%` : `${odds.toFixed(1)}%`;
        if (odds > 50) oddsEl.style.color = "#10b981";
        else if (odds < 10) oddsEl.style.color = "#ef4444";
        else oddsEl.style.color = "#f59e0b";

        
        // Render Momentum (L10)
        const getL10 = (teamRecord) => {
            if (!teamRecord || !teamRecord.records || !teamRecord.records.splitRecords) return "N/A";
            const l10Record = teamRecord.records.splitRecords.find(r => r.type === "lastTen");
            if (l10Record) return `${l10Record.wins}-${l10Record.losses}`;
            return "N/A";
        };
        
        momentumList.innerHTML = "";
        
        // Add Blue Jays L10
        const jaysL10 = getL10(jays);
        momentumList.innerHTML += `
            <div class="momentum-card jays-card" style="border-color: #3b82f6;">
                <h3>TOR Blue Jays</h3>
                <div class="stat">L10: <strong>${jaysL10}</strong></div>
                <div class="stat">Rank: ${rank}</div>
            </div>
        `;
        
        // Add AL WC Leaders L10
        alWildCardLeaders.forEach(team => {
            const l10 = getL10(team);
            momentumList.innerHTML += `
                <div class="momentum-card">
                    <h3>${team.team.name}</h3>
                    <div class="stat">L10: <strong>${l10}</strong></div>
                    <div class="stat">WC Rank: ${team.wildCardRank}</div>
                </div>
            `;
        });

        // ── Outcome Simulator ──────────────────────────────────────────
        const simulatorSection = document.getElementById('outcome-simulator-section');
        if (simulatorSection && gamesRemaining > 0) {
            const currentWins  = jays.wins  || 0;
            const currentLosses = jays.losses || 0;
            const winPct = gamesPlayed > 0 ? currentWins / gamesPlayed : 0.5;
            const defaultSlider = Math.round(winPct * gamesRemaining);
            const currentGB = parseFloat(jays.wildCardGamesBack) || 0;

            const WC_THRESHOLD = 95; // historical AL wild card rough threshold

            function calcProb(projectedFinalWins, projectedGB) {
                let probBase = 1 / (1 + Math.exp(-0.3 * (projectedFinalWins - WC_THRESHOLD)));
                let probGB = 1 / (1 + Math.exp(1.5 * (projectedGB - 0.5)));
                return probBase * probGB;
            }

            function getScenarioLabel(sliderWins) {
                if (sliderWins === gamesRemaining) return "Best case scenario — if the Blue Jays run the table";
                if (sliderWins > Math.round(0.6 * gamesRemaining)) return "Strong finish needed";
                if (sliderWins === Math.round(winPct * gamesRemaining)) return "Current pace (no change)";
                if (sliderWins < Math.round(0.4 * gamesRemaining)) return "Difficult path — would need help from other teams";
                return "Moderate finish";
            }

            simulatorSection.style.display = 'block';
            simulatorSection.innerHTML = `
                <h2 style="font-size:1.5rem; margin-bottom:1.25rem; color:var(--text-muted);">Outcome Simulator</h2>
                <div id="sim-card" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem; position:relative;">
                    <p id="sim-heading" style="font-size:1.15rem; margin:0 0 1.5rem 0; color:var(--text-main);"></p>

                    <!-- Slider -->
                    <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
                        <span style="font-size:0.8rem; color:var(--text-dim); white-space:nowrap;">0 W</span>
                        <input id="sim-slider" type="range" min="0" max="${gamesRemaining}" value="${defaultSlider}" step="1"
                               style="flex:1; accent-color:#3b82f6; cursor:pointer; height:6px;">
                        <span style="font-size:0.8rem; color:var(--text-dim); white-space:nowrap;">${gamesRemaining} W</span>
                    </div>

                    <!-- Win/Loss Visual Bar -->
                    <div id="sim-wl-bar" style="display:flex; height:28px; border-radius:6px; overflow:hidden; margin-bottom:1.25rem; border:1px solid var(--border-color);">
                        <div id="sim-win-bar"  style="background:#10b981; transition:width 0.25s ease; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold; color:#fff; overflow:hidden; white-space:nowrap;"></div>
                        <div id="sim-loss-bar" style="background:#ef4444; transition:width 0.25s ease; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold; color:#fff; overflow:hidden; white-space:nowrap;"></div>
                    </div>

                    <!-- Stats Row -->
                    <div style="display:flex; flex-wrap:wrap; gap:1.5rem; margin-bottom:1.5rem;">
                        <div>
                            <p style="font-size:0.8rem; color:var(--text-dim); margin:0; text-transform:uppercase;">Projected Final Record</p>
                            <p id="sim-record" style="font-size:1.6rem; font-weight:bold; margin:0; color:var(--text-main);"></p>
                        </div>
                        <div>
                            <p style="font-size:0.8rem; color:var(--text-dim); margin:0; text-transform:uppercase;">Playoff Probability</p>
                            <p id="sim-prob" style="font-size:1.6rem; font-weight:bold; margin:0;"></p>
                        </div>
                        <div>
                            <p style="font-size:0.8rem; color:var(--text-dim); margin:0; text-transform:uppercase;">Projected GB (after)</p>
                            <p id="sim-gb" style="font-size:1.6rem; font-weight:bold; margin:0; color:var(--text-main);"></p>
                        </div>
                    </div>

                    <!-- Scenario Description -->
                    <div id="sim-desc" style="padding:0.75rem 1rem; border-radius:var(--radius-md); background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); font-size:0.9rem; color:var(--text-muted);"></div>
                </div>
            `;

            const slider   = document.getElementById('sim-slider');
            const heading  = document.getElementById('sim-heading');
            const winBar   = document.getElementById('sim-win-bar');
            const lossBar  = document.getElementById('sim-loss-bar');
            const recordEl = document.getElementById('sim-record');
            const probEl   = document.getElementById('sim-prob');
            const gbEl2    = document.getElementById('sim-gb');
            const descEl   = document.getElementById('sim-desc');

            function updateSimulator(sliderWins) {
                const sliderLosses = gamesRemaining - sliderWins;
                const projectedFinalWins   = currentWins + sliderWins;
                const projectedFinalLosses = currentLosses + sliderLosses;

                // Heading
                heading.textContent = `If the Blue Jays go ${sliderWins}-${sliderLosses} in their remaining ${gamesRemaining} games…`;

                // W/L bar
                const winPct2 = gamesRemaining > 0 ? sliderWins / gamesRemaining : 0;
                winBar.style.width  = `${winPct2 * 100}%`;
                lossBar.style.width = `${(1 - winPct2) * 100}%`;
                winBar.textContent  = sliderWins  > 0 ? `${sliderWins} W`  : '';
                lossBar.textContent = sliderLosses > 0 ? `${sliderLosses} L` : '';

                // Record
                recordEl.textContent = `${projectedFinalWins}-${projectedFinalLosses}`;

                // Projected GB delta: each net win vs wild card leader reduces GB by 0.5
                const netGames = sliderWins - sliderLosses;
                const newGB = Math.max(0, currentGB - netGames / 2);

                // Probability (sigmoid)
                const rawProb = calcProb(projectedFinalWins, newGB);
                const probPct = Math.round(rawProb * 100);
                probEl.textContent = `${probPct}%`;
                if (probPct > 60) probEl.style.color = '#10b981';
                else if (probPct >= 30) probEl.style.color = '#f59e0b';
                else probEl.style.color = '#ef4444';

                gbEl2.textContent = newGB === 0 ? '—' : newGB.toFixed(1);

                // Scenario label
                descEl.textContent = getScenarioLabel(sliderWins);
            }

            updateSimulator(defaultSlider);
            slider.addEventListener('input', () => updateSimulator(parseInt(slider.value)));
        }
        // ── End Outcome Simulator ──────────────────────────────────────

    } catch (err) {
        console.error("Error fetching Jays data:", err);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
    }
});
