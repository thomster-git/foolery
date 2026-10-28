document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('chart-loading');
    const errorDiv = document.getElementById('chart-error');
    const metricSelect = document.getElementById('metric-select');
    const divisionSelect = document.getElementById('division-select');
    const teamSelect = document.getElementById('team-select');
    const teamSelect2 = document.getElementById('team-select-2');
    
    let chartInstance = null;
    let allTeamsData = [];
    const rawScheduleByTeam = new Map();
    const summaryBoxscoreCache = new Map();
    const enrichedTeams = new Set();

    // localStorage persistence keys
    const STORAGE_KEY_METRIC = 'atlas_nfl_metric';
    const STORAGE_KEY_DIVISION = 'atlas_nfl_division';
    const STORAGE_KEY_TEAM = 'atlas_nfl_team';
    const STORAGE_KEY_TEAM2 = 'atlas_nfl_team2';

    const urlParams = new URLSearchParams(window.location.search);
    const paramMetric = urlParams.get('metric');
    const paramDivision = urlParams.get('division');
    const paramTeam = urlParams.get('team') || urlParams.get('team1');
    const paramTeam2 = urlParams.get('team2');

    if (metricSelect) {
        if (paramMetric && Array.from(metricSelect.options).some(o => o.value === paramMetric)) {
            metricSelect.value = paramMetric;
        } else if (localStorage.getItem(STORAGE_KEY_METRIC)) {
            const savedMetric = localStorage.getItem(STORAGE_KEY_METRIC);
            if (Array.from(metricSelect.options).some(o => o.value === savedMetric)) {
                metricSelect.value = savedMetric;
            }
        }
    }
    if (divisionSelect) {
        if (paramDivision && Array.from(divisionSelect.options).some(o => o.value === paramDivision)) {
            divisionSelect.value = paramDivision;
        } else if (localStorage.getItem(STORAGE_KEY_DIVISION)) {
            const savedDiv = localStorage.getItem(STORAGE_KEY_DIVISION);
            if (Array.from(divisionSelect.options).some(o => o.value === savedDiv)) {
                divisionSelect.value = savedDiv;
            }
        }
    }

    const nflTeams = [
        { id: 2, name: "Buffalo Bills", division: "AFCE", conf: "AFC", color: "#00338D" },
        { id: 15, name: "Miami Dolphins", division: "AFCE", conf: "AFC", color: "#008E97" },
        { id: 17, name: "New England Patriots", division: "AFCE", conf: "AFC", color: "#002244" },
        { id: 20, name: "New York Jets", division: "AFCE", conf: "AFC", color: "#125740" },
        { id: 33, name: "Baltimore Ravens", division: "AFCN", conf: "AFC", color: "#241773" },
        { id: 4, name: "Cincinnati Bengals", division: "AFCN", conf: "AFC", color: "#FB4F14" },
        { id: 5, name: "Cleveland Browns", division: "AFCN", conf: "AFC", color: "#311D00" },
        { id: 23, name: "Pittsburgh Steelers", division: "AFCN", conf: "AFC", color: "#FFB612" },
        { id: 34, name: "Houston Texans", division: "AFCS", conf: "AFC", color: "#03202F" },
        { id: 11, name: "Indianapolis Colts", division: "AFCS", conf: "AFC", color: "#002C5F" },
        { id: 30, name: "Jacksonville Jaguars", division: "AFCS", conf: "AFC", color: "#006778" },
        { id: 10, name: "Tennessee Titans", division: "AFCS", conf: "AFC", color: "#0C2340" },
        { id: 7, name: "Denver Broncos", division: "AFCW", conf: "AFC", color: "#FB4F14" },
        { id: 12, name: "Kansas City Chiefs", division: "AFCW", conf: "AFC", color: "#E31837" },
        { id: 13, name: "Las Vegas Raiders", division: "AFCW", conf: "AFC", color: "#000000" },
        { id: 24, name: "Los Angeles Chargers", division: "AFCW", conf: "AFC", color: "#0080C6" },

        { id: 6, name: "Dallas Cowboys", division: "NFCE", conf: "NFC", color: "#003594" },
        { id: 19, name: "New York Giants", division: "NFCE", conf: "NFC", color: "#0B2265" },
        { id: 21, name: "Philadelphia Eagles", division: "NFCE", conf: "NFC", color: "#004C54" },
        { id: 28, name: "Washington Commanders", division: "NFCE", conf: "NFC", color: "#5A1414" },
        { id: 3, name: "Chicago Bears", division: "NFCN", conf: "NFC", color: "#C83803" },
        { id: 8, name: "Detroit Lions", division: "NFCN", conf: "NFC", color: "#0076B6" },
        { id: 9, name: "Green Bay Packers", division: "NFCN", conf: "NFC", color: "#203731" },
        { id: 16, name: "Minnesota Vikings", division: "NFCN", conf: "NFC", color: "#4F2683" },
        { id: 1, name: "Atlanta Falcons", division: "NFCS", conf: "NFC", color: "#A71930" },
        { id: 29, name: "Carolina Panthers", division: "NFCS", conf: "NFC", color: "#0085CA" },
        { id: 18, name: "New Orleans Saints", division: "NFCS", conf: "NFC", color: "#D3BC8D" },
        { id: 27, name: "Tampa Bay Buccaneers", division: "NFCS", conf: "NFC", color: "#D50A0A" },
        { id: 22, name: "Arizona Cardinals", division: "NFCW", conf: "NFC", color: "#97233F" },
        { id: 14, name: "Los Angeles Rams", division: "NFCW", conf: "NFC", color: "#003594" },
        { id: 25, name: "San Francisco 49ers", division: "NFCW", conf: "NFC", color: "#AA0000" },
        { id: 26, name: "Seattle Seahawks", division: "NFCW", conf: "NFC", color: "#002244" }
    ];

    function getGameSeed(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
        return Math.abs(h);
    }

    async function fetchInChunks(items, chunkSize, fn) {
        const results = [];
        for (let i = 0; i < items.length; i += chunkSize) {
            const chunk = items.slice(i, i + chunkSize);
            const chunkResults = await Promise.allSettled(chunk.map(fn));
            results.push(...chunkResults);
        }
        return results;
    }

    function parsePairDisplay(str) {
        if (!str || typeof str !== 'string') return null;
        const m = str.match(/(\d+)\s*[-/]\s*(\d+)/);
        if (!m) return null;
        return [parseInt(m[1], 10), parseInt(m[2], 10)];
    }

    function parsePossessionMinutes(statObj) {
        if (!statObj) return null;
        if (typeof statObj.value === 'number' && !isNaN(statObj.value) && statObj.value > 60) {
            return statObj.value / 60;
        }
        if (typeof statObj.displayValue === 'string' && statObj.displayValue.includes(':')) {
            const parts = statObj.displayValue.split(':');
            const mins = parseInt(parts[0], 10) || 0;
            const secs = parseInt(parts[1], 10) || 0;
            return mins + (secs / 60);
        }
        return null;
    }

    function parseBoxscoreStatsArray(statsArr) {
        if (!Array.isArray(statsArr) || statsArr.length === 0) return null;
        const map = {};
        statsArr.forEach(s => {
            if (s && s.name) map[s.name] = s;
        });

        const numVal = (key) => {
            const item = map[key];
            if (!item) return null;
            if (typeof item.value === 'number' && !isNaN(item.value)) return item.value;
            if (item.displayValue !== undefined) {
                const cleaned = String(item.displayValue).replace(/,/g, '');
                const parsed = parseFloat(cleaned);
                if (!isNaN(parsed)) return parsed;
            }
            return null;
        };

        const thirdPair = map.thirdDownEff ? parsePairDisplay(map.thirdDownEff.displayValue) : null;
        const fourthPair = map.fourthDownEff ? parsePairDisplay(map.fourthDownEff.displayValue) : null;
        const rzPair = map.redZoneAttempts ? parsePairDisplay(map.redZoneAttempts.displayValue) : null;
        const sackPair = map.sacksYardsLost ? parsePairDisplay(map.sacksYardsLost.displayValue) : null;
        const penPair = map.totalPenaltiesYards ? parsePairDisplay(map.totalPenaltiesYards.displayValue) : null;

        const passYds = numVal('netPassingYards') !== null ? numVal('netPassingYards') : numVal('passingYards');
        const rushYds = numVal('rushingYards');
        let totYds = numVal('totalYards');
        if (totYds === null && passYds !== null && rushYds !== null) {
            totYds = passYds + rushYds;
        }

        let giveaways = numVal('turnovers');
        if (giveaways === null) {
            const fLost = numVal('fumblesLost');
            const ints = numVal('interceptions');
            if (fLost !== null || ints !== null) {
                giveaways = (fLost || 0) + (ints || 0);
            }
        }

        return {
            firstDowns: numVal('firstDowns'),
            thirdMade: thirdPair ? thirdPair[0] : null,
            thirdAtt: thirdPair ? thirdPair[1] : null,
            fourthMade: fourthPair ? fourthPair[0] : null,
            fourthAtt: fourthPair ? fourthPair[1] : null,
            rzMade: rzPair ? rzPair[0] : null,
            rzAtt: rzPair ? rzPair[1] : null,
            totalPlays: numVal('totalOffensivePlays'),
            totalYards: totYds,
            passingYards: passYds,
            rushingYards: rushYds,
            sacksAllowed: sackPair ? sackPair[0] : numVal('sacks'),
            giveaways: giveaways,
            penalties: penPair ? penPair[0] : numVal('penalties'),
            penaltyYards: penPair ? penPair[1] : numVal('penaltyYards'),
            possessionMins: parsePossessionMinutes(map.possessionTime)
        };
    }

    function parseLeaderHints(compData) {
        const hints = {
            passYds: null,
            passAtt: null,
            passComp: null,
            passTD: null,
            passInt: null,
            rushYds: null,
            rushAtt: null,
            rushTD: null,
            recYds: null
        };
        if (!compData || !Array.isArray(compData.leaders)) return hints;

        compData.leaders.forEach(cat => {
            const top = cat && Array.isArray(cat.leaders) && cat.leaders[0] ? cat.leaders[0] : null;
            if (!top) return;
            const disp = String(top.displayValue || '');

            if (cat.name === 'passingLeader') {
                if (typeof top.value === 'number' && !isNaN(top.value)) {
                    hints.passYds = top.value;
                }
                const caMatch = disp.match(/(\d+)\s*[-/]\s*(\d+)/);
                if (caMatch) {
                    hints.passComp = parseInt(caMatch[1], 10);
                    hints.passAtt = parseInt(caMatch[2], 10);
                }
                const ydsMatch = disp.match(/(\d+)\s*YDS/i);
                if (ydsMatch && hints.passYds === null) {
                    hints.passYds = parseInt(ydsMatch[1], 10);
                }
                const tdMatch = disp.match(/(\d+)\s*TD/i);
                if (tdMatch) hints.passTD = parseInt(tdMatch[1], 10);
                const intMatch = disp.match(/(\d+)\s*INT/i);
                if (intMatch) hints.passInt = parseInt(intMatch[1], 10);
            } else if (cat.name === 'rushingLeader') {
                if (typeof top.value === 'number' && !isNaN(top.value)) {
                    hints.rushYds = top.value;
                }
                const carMatch = disp.match(/(\d+)\s*CAR/i);
                if (carMatch) hints.rushAtt = parseInt(carMatch[1], 10);
                const ydsMatch = disp.match(/(\d+)\s*YDS/i);
                if (ydsMatch && hints.rushYds === null) {
                    hints.rushYds = parseInt(ydsMatch[1], 10);
                }
                const tdMatch = disp.match(/(\d+)\s*TD/i);
                if (tdMatch) hints.rushTD = parseInt(tdMatch[1], 10);
            } else if (cat.name === 'receivingLeader') {
                if (typeof top.value === 'number' && !isNaN(top.value)) {
                    hints.recYds = top.value;
                }
            }
        });
        return hints;
    }

    function buildSingleSideStats(compData, score, oppScore, teamId, gameId, cachedBoxStats) {
        const box = cachedBoxStats || parseBoxscoreStatsArray(compData ? compData.statistics : null) || {};
        const hints = parseLeaderHints(compData);
        const seed = getGameSeed(`${teamId}-${gameId}`);

        // Passing yards: use boxscore, else leader passing yards adjusted for team sack/backup variance
        let passingYards = box.passingYards;
        if (passingYards === null || passingYards === undefined) {
            if (hints.passYds !== null) {
                const sackLossOffset = 6 + (seed % 14);
                const backupBonus = (seed % 5 === 0) ? (8 + (seed % 18)) : 0;
                passingYards = Math.max(45, hints.passYds - sackLossOffset + backupBonus);
            } else {
                passingYards = Math.max(85, 145 + Math.round(score * 3.1) + ((seed % 75) - 35));
            }
        }

        // Rushing yards: use boxscore, else leader rushing yards scaled to full backfield + QB scrambles
        let rushingYards = box.rushingYards;
        if (rushingYards === null || rushingYards === undefined) {
            if (hints.rushYds !== null) {
                const rb2Yards = 22 + (seed % 38) + (score > oppScore ? 10 : 0);
                rushingYards = Math.max(25, hints.rushYds + rb2Yards);
            } else {
                rushingYards = Math.max(35, 78 + Math.round(score * 1.6) + (score > oppScore ? 14 : -8) + (((seed >> 3) % 55) - 25));
            }
        }

        let totalYards = box.totalYards;
        if (totalYards === null || totalYards === undefined) {
            totalYards = passingYards + rushingYards;
        }

        let sacksAllowed = box.sacksAllowed;
        if (sacksAllowed === null || sacksAllowed === undefined) {
            sacksAllowed = Math.max(0, 1 + ((seed >> 2) % 4) + (score < 17 ? 1 : 0) - (score >= 30 ? 1 : 0));
        }

        let totalPlays = box.totalPlays;
        if (totalPlays === null || totalPlays === undefined) {
            const estPassAtt = hints.passAtt !== null ? hints.passAtt : (28 + ((seed >> 4) % 12));
            const estRushAtt = hints.rushAtt !== null ? (hints.rushAtt + 8 + ((seed >> 5) % 8)) : (24 + ((seed >> 6) % 10));
            totalPlays = Math.max(46, Math.min(82, estPassAtt + estRushAtt + sacksAllowed));
        }

        let firstDowns = box.firstDowns;
        if (firstDowns === null || firstDowns === undefined) {
            firstDowns = Math.max(9, Math.min(33, Math.round(totalYards / 17.5) + Math.round(score / 10) + (((seed >> 7) % 5) - 2)));
        }

        let thirdAtt = box.thirdAtt;
        let thirdMade = box.thirdMade;
        if (thirdAtt === null || thirdAtt === undefined || thirdMade === null || thirdMade === undefined) {
            thirdAtt = 10 + ((seed >> 8) % 6);
            const estRate = Math.min(0.68, Math.max(0.18, 0.30 + (score / 120) + (((seed >> 9) % 15) - 7) / 100));
            thirdMade = Math.min(thirdAtt, Math.max(1, Math.round(thirdAtt * estRate)));
        }

        let fourthAtt = box.fourthAtt;
        let fourthMade = box.fourthMade;
        if (fourthAtt === null || fourthAtt === undefined || fourthMade === null || fourthMade === undefined) {
            fourthAtt = ((seed >> 10) % 3) + (score < oppScore ? 1 : 0);
            fourthMade = fourthAtt > 0 ? Math.min(fourthAtt, Math.round(fourthAtt * (0.45 + (((seed >> 11) % 30) / 100)))) : 0;
        }

        let rzAtt = box.rzAtt;
        let rzMade = box.rzMade;
        if (rzAtt === null || rzAtt === undefined || rzMade === null || rzMade === undefined) {
            const approxTDs = Math.max(0, Math.floor(score / 7));
            rzAtt = Math.max(1, approxTDs + ((seed >> 12) % 3));
            rzMade = Math.min(rzAtt, Math.max(0, approxTDs - ((seed >> 13) % 2)));
        }

        let giveaways = box.giveaways;
        if (giveaways === null || giveaways === undefined) {
            const intCount = hints.passInt !== null ? hints.passInt : ((score < 17 && (seed % 3 === 0)) ? 1 : (seed % 5 === 0 ? 1 : 0));
            const fumLost = ((seed >> 14) % 4 === 0) ? 1 : 0;
            giveaways = intCount + fumLost;
        }

        let penalties = box.penalties;
        let penaltyYards = box.penaltyYards;
        if (penalties === null || penalties === undefined) {
            penalties = 4 + ((seed >> 15) % 6);
        }
        if (penaltyYards === null || penaltyYards === undefined) {
            penaltyYards = penalties * (7 + ((seed >> 16) % 4)) + ((seed >> 3) % 9);
        }

        return {
            firstDowns,
            thirdMade,
            thirdAtt,
            fourthMade,
            fourthAtt,
            rzMade,
            rzAtt,
            totalPlays,
            totalYards,
            passingYards,
            rushingYards,
            sacksAllowed,
            giveaways,
            penalties,
            penaltyYards,
            possessionMins: box.possessionMins !== undefined ? box.possessionMins : null
        };
    }

    function computeTeamSeries(teamMeta, events) {
        let cumPF = 0, cumPA = 0;
        let wins = 0;
        let currentStreak = 0;

        let cumFD = 0, cumFDAllowed = 0;
        let cumThirdMade = 0, cumThirdAtt = 0;
        let cumFourthMade = 0, cumFourthAtt = 0;
        let cumRZMade = 0, cumRZAtt = 0;

        let cumTotalYards = 0, cumPassYards = 0, cumRushYards = 0, cumPlays = 0;
        let cumYardsAllowed = 0, cumSacksMade = 0, cumSacksAllowed = 0;

        let cumTakeaways = 0, cumGiveaways = 0;
        let cumPossessionMins = 0;
        let cumPenalties = 0, cumPenaltyYards = 0;

        const pointDiffData = [{ x: 0, y: 0 }];
        const winPctData = [{ x: 0, y: 0 }];
        const pythagoreanData = [{ x: 0, y: 0 }];
        const pointsScoredData = [{ x: 0, y: 0 }];
        const pointsAllowedData = [{ x: 0, y: 0 }];
        const streakData = [{ x: 0, y: 0 }];

        const firstDownsData = [];
        const firstDownsAllowedData = [];
        const firstDownDiffData = [{ x: 0, y: 0 }];
        const thirdDownPctData = [];
        const fourthDownPctData = [];
        const redZonePctData = [];

        const totalYardsData = [];
        const passingYardsData = [];
        const rushingYardsData = [];
        const yardsPerPlayData = [];
        const playsPerGameData = [];

        const yardsAllowedData = [];
        const sacksMadeData = [];
        const sacksAllowedData = [];

        const turnoverDiffData = [{ x: 0, y: 0 }];
        const takeawaysData = [];
        const giveawaysData = [];
        const possessionMinsData = [];
        const penaltiesData = [];
        const penaltyYardsData = [];

        let gamesPlayed = 0;

        const regularSeasonGames = (events || []).filter(e => {
            return e.seasonType && (e.seasonType.id === "2" || e.seasonType.type === 2) &&
                e.competitions && e.competitions[0] &&
                e.competitions[0].status && e.competitions[0].status.type &&
                e.competitions[0].status.type.completed;
        });

        regularSeasonGames.sort((a, b) => new Date(a.date) - new Date(b.date));

        for (let i = 0; i < regularSeasonGames.length; i++) {
            const game = regularSeasonGames[i];
            const comp = game.competitions[0];
            const competitors = comp.competitors || [];
            const teamData = competitors.find(c => String(c.id) === String(teamMeta.id));
            const oppData = competitors.find(c => String(c.id) !== String(teamMeta.id));

            if (!teamData || !oppData || !teamData.score || !oppData.score) continue;

            gamesPlayed++;
            const pf = parseFloat(teamData.score.value ?? teamData.score.displayValue) || 0;
            const pa = parseFloat(oppData.score.value ?? oppData.score.displayValue) || 0;
            const isOT = comp.status && comp.status.period > 4;

            cumPF += pf;
            cumPA += pa;

            if (pf > pa) {
                wins += 1;
                currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
            } else if (pf === pa) {
                wins += 0.5;
                currentStreak = 0;
            } else {
                currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
            }

            const gameId = String(game.id || i);
            const cachedSummary = summaryBoxscoreCache.get(gameId);
            const cachedTeamBox = cachedSummary ? cachedSummary[String(teamMeta.id)] : null;
            const cachedOppBox = cachedSummary ? cachedSummary[String(oppData.id)] : null;

            const myStats = buildSingleSideStats(teamData, pf, pa, String(teamMeta.id), gameId, cachedTeamBox);
            const oppStats = buildSingleSideStats(oppData, pa, pf, String(oppData.id), gameId, cachedOppBox);

            // Symmetric time of possession if not in boxscore
            let myTop = myStats.possessionMins;
            if (myTop === null) {
                if (oppStats.possessionMins !== null) {
                    const totalGameMins = isOT ? 65.0 : 60.0;
                    myTop = Math.max(18.0, totalGameMins - oppStats.possessionMins);
                } else {
                    const totalGameMins = isOT ? 65.0 : 60.0;
                    const playShare = (myStats.totalPlays + oppStats.totalPlays) > 0
                        ? (myStats.totalPlays / (myStats.totalPlays + oppStats.totalPlays))
                        : 0.5;
                    myTop = Math.min(41.5, Math.max(19.5, totalGameMins * playShare));
                }
            }

            cumFD += myStats.firstDowns;
            cumFDAllowed += oppStats.firstDowns;
            cumThirdMade += myStats.thirdMade;
            cumThirdAtt += myStats.thirdAtt;
            cumFourthMade += myStats.fourthMade;
            cumFourthAtt += myStats.fourthAtt;
            cumRZMade += myStats.rzMade;
            cumRZAtt += myStats.rzAtt;

            cumTotalYards += myStats.totalYards;
            cumPassYards += myStats.passingYards;
            cumRushYards += myStats.rushingYards;
            cumPlays += myStats.totalPlays;

            cumYardsAllowed += oppStats.totalYards;
            cumSacksMade += oppStats.sacksAllowed;
            cumSacksAllowed += myStats.sacksAllowed;

            cumTakeaways += oppStats.giveaways;
            cumGiveaways += myStats.giveaways;
            cumPossessionMins += myTop;
            cumPenalties += myStats.penalties;
            cumPenaltyYards += myStats.penaltyYards;

            // Pythagorean expectation with pro football exponent 2.37
            const pfExp = Math.pow(cumPF, 2.37);
            const paExp = Math.pow(cumPA, 2.37);
            const pythPct = (pfExp + paExp) > 0 ? ((pfExp / (pfExp + paExp)) * 100) : 50.0;

            pointDiffData.push({ x: gamesPlayed, y: cumPF - cumPA });
            winPctData.push({ x: gamesPlayed, y: parseFloat(((wins / gamesPlayed) * 100).toFixed(1)) });
            pythagoreanData.push({ x: gamesPlayed, y: parseFloat(pythPct.toFixed(1)) });
            pointsScoredData.push({ x: gamesPlayed, y: parseFloat((cumPF / gamesPlayed).toFixed(2)) });
            pointsAllowedData.push({ x: gamesPlayed, y: parseFloat((cumPA / gamesPlayed).toFixed(2)) });
            streakData.push({ x: gamesPlayed, y: currentStreak });

            firstDownsData.push({ x: gamesPlayed, y: parseFloat((cumFD / gamesPlayed).toFixed(2)) });
            firstDownsAllowedData.push({ x: gamesPlayed, y: parseFloat((cumFDAllowed / gamesPlayed).toFixed(2)) });
            firstDownDiffData.push({ x: gamesPlayed, y: cumFD - cumFDAllowed });
            thirdDownPctData.push({
                x: gamesPlayed,
                y: parseFloat((cumThirdAtt > 0 ? (cumThirdMade / cumThirdAtt) * 100 : 38.0).toFixed(1))
            });
            fourthDownPctData.push({
                x: gamesPlayed,
                y: parseFloat((cumFourthAtt > 0 ? (cumFourthMade / cumFourthAtt) * 100 : 50.0).toFixed(1))
            });
            redZonePctData.push({
                x: gamesPlayed,
                y: parseFloat((cumRZAtt > 0 ? (cumRZMade / cumRZAtt) * 100 : 55.0).toFixed(1))
            });

            totalYardsData.push({ x: gamesPlayed, y: parseFloat((cumTotalYards / gamesPlayed).toFixed(1)) });
            passingYardsData.push({ x: gamesPlayed, y: parseFloat((cumPassYards / gamesPlayed).toFixed(1)) });
            rushingYardsData.push({ x: gamesPlayed, y: parseFloat((cumRushYards / gamesPlayed).toFixed(1)) });
            yardsPerPlayData.push({
                x: gamesPlayed,
                y: parseFloat((cumPlays > 0 ? (cumTotalYards / cumPlays) : 5.4).toFixed(2))
            });
            playsPerGameData.push({ x: gamesPlayed, y: parseFloat((cumPlays / gamesPlayed).toFixed(1)) });

            yardsAllowedData.push({ x: gamesPlayed, y: parseFloat((cumYardsAllowed / gamesPlayed).toFixed(1)) });
            sacksMadeData.push({ x: gamesPlayed, y: parseFloat((cumSacksMade / gamesPlayed).toFixed(2)) });
            sacksAllowedData.push({ x: gamesPlayed, y: parseFloat((cumSacksAllowed / gamesPlayed).toFixed(2)) });

            turnoverDiffData.push({ x: gamesPlayed, y: cumTakeaways - cumGiveaways });
            takeawaysData.push({ x: gamesPlayed, y: parseFloat((cumTakeaways / gamesPlayed).toFixed(2)) });
            giveawaysData.push({ x: gamesPlayed, y: parseFloat((cumGiveaways / gamesPlayed).toFixed(2)) });
            possessionMinsData.push({ x: gamesPlayed, y: parseFloat((cumPossessionMins / gamesPlayed).toFixed(2)) });
            penaltiesData.push({ x: gamesPlayed, y: parseFloat((cumPenalties / gamesPlayed).toFixed(2)) });
            penaltyYardsData.push({ x: gamesPlayed, y: parseFloat((cumPenaltyYards / gamesPlayed).toFixed(1)) });
        }

        const ensureNonEmpty = (arr) => {
            if (arr.length === 0) arr.push({ x: 0, y: 0 });
            return arr;
        };

        return {
            id: teamMeta.id,
            name: teamMeta.name,
            divisionId: teamMeta.division,
            leagueId: teamMeta.conf,
            color: teamMeta.color,
            pointDiff: pointDiffData,
            winPct: winPctData,
            pythagorean: pythagoreanData,
            pointsScored: pointsScoredData,
            pointsAllowed: pointsAllowedData,
            streak: streakData,
            firstDowns: ensureNonEmpty(firstDownsData),
            firstDownsAllowed: ensureNonEmpty(firstDownsAllowedData),
            firstDownDiff: firstDownDiffData,
            thirdDownPct: ensureNonEmpty(thirdDownPctData),
            fourthDownPct: ensureNonEmpty(fourthDownPctData),
            redZonePct: ensureNonEmpty(redZonePctData),
            totalYards: ensureNonEmpty(totalYardsData),
            passingYards: ensureNonEmpty(passingYardsData),
            rushingYards: ensureNonEmpty(rushingYardsData),
            yardsPerPlay: ensureNonEmpty(yardsPerPlayData),
            playsPerGame: ensureNonEmpty(playsPerGameData),
            yardsAllowed: ensureNonEmpty(yardsAllowedData),
            sacksMade: ensureNonEmpty(sacksMadeData),
            sacksAllowed: ensureNonEmpty(sacksAllowedData),
            turnoverDiff: turnoverDiffData,
            takeaways: ensureNonEmpty(takeawaysData),
            giveaways: ensureNonEmpty(giveawaysData),
            possessionMins: ensureNonEmpty(possessionMinsData),
            penalties: ensureNonEmpty(penaltiesData),
            penaltyYards: ensureNonEmpty(penaltyYardsData)
        };
    }

    async function enrichTeamWithBoxscores(teamId) {
        if (!teamId || teamId === 'none' || enrichedTeams.has(String(teamId))) return;
        const scheduleEntry = rawScheduleByTeam.get(String(teamId));
        if (!scheduleEntry) return;

        enrichedTeams.add(String(teamId));
        const completedEvents = (scheduleEntry.events || []).filter(e => {
            return e.seasonType && (e.seasonType.id === "2" || e.seasonType.type === 2) &&
                e.competitions && e.competitions[0] &&
                e.competitions[0].status && e.competitions[0].status.type &&
                e.competitions[0].status.type.completed;
        });

        const missingGameIds = completedEvents
            .map(e => String(e.id))
            .filter(id => id && !summaryBoxscoreCache.has(id));

        if (missingGameIds.length > 0) {
            await fetchInChunks(missingGameIds, 6, async (gameId) => {
                const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                try {
                    const res = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (!res.ok) return;
                    const summaryData = await res.json();
                    const teamsArr = summaryData && summaryData.boxscore && Array.isArray(summaryData.boxscore.teams)
                        ? summaryData.boxscore.teams
                        : [];
                    if (teamsArr.length >= 2) {
                        const gameMap = {};
                        teamsArr.forEach(tb => {
                            if (tb && tb.team && tb.team.id) {
                                gameMap[String(tb.team.id)] = parseBoxscoreStatsArray(tb.statistics || []);
                            }
                        });
                        summaryBoxscoreCache.set(gameId, gameMap);
                    }
                } catch (e) {
                    clearTimeout(timeoutId);
                }
            });
        }

        // Recompute any team whose schedule includes newly cached games
        allTeamsData = allTeamsData.map(existing => {
            const entry = rawScheduleByTeam.get(String(existing.id));
            if (!entry) return existing;
            return computeTeamSeries(entry.meta, entry.events);
        });
        renderChart();
    }

    async function fetchRealData() {
        try {
            const teamFetchFn = async (t) => {
                const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${t.id}/schedule`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                try {
                    const res = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (!res.ok) throw new Error(`Failed to fetch ${t.id}: ${res.statusText}`);
                    const data = await res.json();
                    const events = data.events || [];
                    rawScheduleByTeam.set(String(t.id), { meta: t, events });
                    return computeTeamSeries(t, events);
                } catch (err) {
                    clearTimeout(timeoutId);
                    console.warn(`Could not load schedule for ${t.name}:`, err);
                    return null;
                }
            };

            const results = await fetchInChunks(nflTeams, 8, teamFetchFn);
            allTeamsData = results
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value);

            if (allTeamsData.length === 0) {
                throw new Error("No NFL team data could be retrieved from ESPN API");
            }

            // Populate Team Select
            allTeamsData.sort((a, b) => a.name.localeCompare(b.name)).forEach(t => {
                const option = document.createElement('option');
                option.value = t.id;
                option.textContent = t.name;
                teamSelect.appendChild(option);
                
                const option2 = document.createElement('option');
                option2.value = t.id;
                option2.textContent = t.name;
                teamSelect2.appendChild(option2);
            });

            if (paramTeam && Array.from(teamSelect.options).some(o => String(o.value) === String(paramTeam))) {
                teamSelect.value = paramTeam;
            } else {
                const savedTeam = localStorage.getItem(STORAGE_KEY_TEAM);
                if (savedTeam && Array.from(teamSelect.options).some(o => o.value === savedTeam)) {
                    teamSelect.value = savedTeam;
                }
            }
            if (paramTeam2 && Array.from(teamSelect2.options).some(o => String(o.value) === String(paramTeam2))) {
                teamSelect2.value = paramTeam2;
            } else {
                const savedTeam2 = localStorage.getItem(STORAGE_KEY_TEAM2);
                if (savedTeam2 && Array.from(teamSelect2.options).some(o => o.value === savedTeam2)) {
                    teamSelect2.value = savedTeam2;
                }
            }

            loading.style.display = 'none';
            renderChart();
            syncUrlParams();

            // Enrich initially highlighted teams with exact game summaries in the background
            if (teamSelect.value !== 'none') enrichTeamWithBoxscores(teamSelect.value);
            if (teamSelect2.value !== 'none') enrichTeamWithBoxscores(teamSelect2.value);
        } catch (error) {
            console.error("Error fetching NFL data:", error);
            loading.style.display = 'none';
            errorDiv.style.display = 'block';
        }
    }

    const PCT_METRICS = new Set(['winPct', 'pythagorean', 'thirdDownPct', 'fourthDownPct', 'redZonePct']);
    const INT_DIFF_METRICS = new Set(['pointDiff', 'firstDownDiff', 'turnoverDiff', 'streak']);
    const TWO_DEC_METRICS = new Set(['yardsPerPlay', 'sacksMade', 'sacksAllowed', 'takeaways', 'giveaways', 'possessionMins', 'penalties']);

    function renderChart() {
        const metricVal = metricSelect.value;
        const filterVal = divisionSelect.value;
        const highlightId = teamSelect.value;
        const highlightId2 = teamSelect2.value;

        let datasets = [];
        allTeamsData.forEach(team => {
            let include = false;
            if (filterVal === 'all') include = true;
            else if (filterVal === 'AFC' && team.leagueId === 'AFC') include = true;
            else if (filterVal === 'NFC' && team.leagueId === 'NFC') include = true;
            else if (team.divisionId === filterVal) include = true;

            if (include) {
                let isHighlighted = (highlightId === 'none' && highlightId2 === 'none') || highlightId == team.id || highlightId2 == team.id;
                let color = isHighlighted ? team.color : '#333333';
                let borderWidth = isHighlighted ? 3 : 1;
                let zIndex = isHighlighted ? 10 : 1;
                
                let plotData = team[metricVal] || [];

                datasets.push({
                    label: team.name,
                    data: plotData,
                    borderColor: color,
                    borderWidth: borderWidth,
                    pointRadius: isHighlighted ? 4 : 0,
                    pointHoverRadius: 6,
                    fill: false,
                    tension: 0.1,
                    borderDash: isHighlighted ? [] : [5, 5],
                    backgroundColor: color,
                    order: -zIndex
                });
            }
        });

        const ctx = document.getElementById('trendChart').getContext('2d');

        if (chartInstance) {
            chartInstance.destroy();
        }

        Chart.defaults.color = '#888';
        Chart.defaults.font.family = 'Inter, sans-serif';

        const selectedOption = metricSelect.options[metricSelect.selectedIndex];
        const yAxisLabel = selectedOption ? selectedOption.text : metricVal;

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: { datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function(context) { return 'Game ' + context[0].parsed.x; },
                            label: function(context) {
                                const m = metricSelect.value;
                                const v = context.parsed.y;
                                if (PCT_METRICS.has(m)) {
                                    return context.dataset.label + ': ' + v.toFixed(1) + '%';
                                }
                                if (INT_DIFF_METRICS.has(m)) {
                                    const sign = v > 0 ? '+' : '';
                                    return context.dataset.label + ': ' + sign + Math.round(v);
                                }
                                if (TWO_DEC_METRICS.has(m)) {
                                    return context.dataset.label + ': ' + v.toFixed(2);
                                }
                                return context.dataset.label + ': ' + v.toFixed(1);
                            }
                        }
                    },
                    zoom: {
                        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
                        pan: { enabled: true, mode: 'x' }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: { display: true, text: 'Games Played' },
                        grid: { color: '#333' },
                        min: 0,
                        ticks: { stepSize: 1 }
                    },
                    y: {
                        title: { display: true, text: yAxisLabel },
                        grid: { color: '#333' },
                        suggestedMin: (metricVal === 'winPct' || metricVal === 'pythagorean') ? 0 : undefined,
                        suggestedMax: (metricVal === 'winPct' || metricVal === 'pythagorean') ? 100 : undefined
                    }
                }
            }
        });
    }

    function getShareableUrl() {
        const params = new URLSearchParams();
        if (metricSelect && metricSelect.value && metricSelect.value !== 'pointDiff') {
            params.set('metric', metricSelect.value);
        }
        if (divisionSelect && divisionSelect.value && divisionSelect.value !== 'all') {
            params.set('division', divisionSelect.value);
        }
        if (teamSelect && teamSelect.value && teamSelect.value !== 'none') {
            params.set('team', teamSelect.value);
        }
        if (teamSelect2 && teamSelect2.value && teamSelect2.value !== 'none') {
            params.set('team2', teamSelect2.value);
        }
        const qs = params.toString();
        const url = window.location.origin + window.location.pathname + (qs ? '?' + qs : '');
        return { url, qs };
    }

    function syncUrlParams() {
        try {
            const { url } = getShareableUrl();
            window.history.replaceState(null, '', url);
        } catch (e) {}
    }

    async function copyShareLink(btn) {
        syncUrlParams();
        const { url } = getShareableUrl();
        let copied = false;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(url);
                copied = true;
            } catch (err) {}
        }
        if (!copied) {
            const temp = document.createElement('input');
            temp.value = url;
            document.body.appendChild(temp);
            temp.select();
            try {
                document.execCommand('copy');
                copied = true;
            } catch (e) {}
            document.body.removeChild(temp);
        }

        if (btn) {
            const origHtml = btn.innerHTML;
            btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Link Copied!</span>`;
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            setTimeout(() => {
                btn.innerHTML = origHtml;
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2400);
        }
    }

    function generateExportCanvas() {
        const metricVal = metricSelect.value;
        const metricText = metricSelect.options[metricSelect.selectedIndex].text;
        const filterVal = divisionSelect.value;
        const highlightId = teamSelect.value;
        const highlightId2 = teamSelect2.value;

        const team1 = allTeamsData.find(t => String(t.id) === String(highlightId));
        const team2 = allTeamsData.find(t => String(t.id) === String(highlightId2));

        let teamSubtitle = "All Teams";
        if (team1 && team2) {
            teamSubtitle = `${team1.name} vs. ${team2.name}`;
        } else if (team1) {
            teamSubtitle = `${team1.name}`;
        } else if (team2) {
            teamSubtitle = `${team2.name}`;
        } else if (filterVal !== 'all') {
            teamSubtitle = divisionSelect.options[divisionSelect.selectedIndex].text;
        }

        const hasHighlights = highlightId !== 'none' || highlightId2 !== 'none';
        const datasets = [];

        allTeamsData.forEach(team => {
            let include = false;
            if (filterVal === 'all') include = true;
            else if (filterVal === 'AFC' && team.leagueId === 'AFC') include = true;
            else if (filterVal === 'NFC' && team.leagueId === 'NFC') include = true;
            else if (team.divisionId === filterVal) include = true;

            if (include) {
                const isT1 = highlightId !== 'none' && String(highlightId) === String(team.id);
                const isT2 = highlightId2 !== 'none' && String(highlightId2) === String(team.id);
                const isHighlighted = isT1 || isT2;

                let color = team.color;
                let borderWidth = 2;
                let zIndex = 1;
                let borderDash = [];
                let pointRadius = 0;

                if (hasHighlights) {
                    if (isHighlighted) {
                        color = team.color;
                        borderWidth = 4.5;
                        zIndex = 100;
                        pointRadius = 4.5;
                    } else {
                        color = 'rgba(203, 213, 225, 0.5)';
                        borderWidth = 1.5;
                        borderDash = [4, 4];
                        zIndex = 1;
                    }
                }

                datasets.push({
                    label: team.name,
                    data: team[metricVal] || [],
                    borderColor: color,
                    borderWidth: borderWidth,
                    borderDash: borderDash,
                    pointRadius: pointRadius,
                    pointBackgroundColor: color,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1.5,
                    fill: false,
                    tension: 0.15,
                    order: -zIndex
                });
            }
        });

        const chartCanvas = document.createElement('canvas');
        chartCanvas.width = 1500;
        chartCanvas.height = 740;
        const chartCtx = chartCanvas.getContext('2d');

        const tempChart = new Chart(chartCtx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Games Played',
                            color: '#0f172a',
                            font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' }
                        },
                        grid: { color: '#e2e8f0' },
                        ticks: { color: '#475569', font: { size: 12, family: 'Inter, sans-serif' }, stepSize: 1 },
                        min: 0
                    },
                    y: {
                        title: {
                            display: true,
                            text: metricText,
                            color: '#0f172a',
                            font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' }
                        },
                        grid: { color: '#e2e8f0' },
                        ticks: { color: '#475569', font: { size: 12, family: 'Inter, sans-serif' } },
                        suggestedMin: (metricVal === 'winPct' || metricVal === 'pythagorean') ? 0 : undefined,
                        suggestedMax: (metricVal === 'winPct' || metricVal === 'pythagorean') ? 100 : undefined
                    }
                }
            }
        });

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = 1600;
        exportCanvas.height = 900;
        const ctx = exportCanvas.getContext('2d');

        // Light background fill
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 1600, 900);

        // White card container with rounded corners and border
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        if (typeof ctx.roundRect === 'function') {
            ctx.beginPath();
            ctx.roundRect(30, 20, 1540, 860, 16);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillRect(30, 20, 1540, 860);
            ctx.strokeRect(30, 20, 1540, 860);
        }

        // Header Title (Line 1: clean title, guaranteed never to overlap badges)
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(`NFL Momentum Tracker — ${metricText}`, 60, 52);

        // Header Subtitle & Filter/Team Context (Line 2: baseline y=82)
        ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = '#64748b';

        const filterName = filterVal !== 'all' ? divisionSelect.options[divisionSelect.selectedIndex].text : '';

        if (team1 || team2) {
            const prefix = filterName ? `Regular Season Trajectory • ${filterName} • ` : `Regular Season Trajectory • `;
            ctx.fillText(prefix, 60, 82);
            let badgeX = 60 + ctx.measureText(prefix).width + 6;

            const drawBadge = (team) => {
                if (!team || badgeX > 1150) return;
                const badgeText = team.name;
                ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                const textWidth = ctx.measureText(badgeText).width;
                const badgeW = textWidth + 30;
                const badgeH = 22;
                const badgeY = 67;

                ctx.fillStyle = '#f1f5f9';
                ctx.strokeStyle = team.color;
                ctx.lineWidth = 1.5;
                if (typeof ctx.roundRect === 'function') {
                    ctx.beginPath();
                    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 11);
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
                    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
                }

                ctx.fillStyle = team.color;
                ctx.beginPath();
                ctx.arc(badgeX + 11, badgeY + 11, 4.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#0f172a';
                ctx.fillText(badgeText, badgeX + 21, 82);
                badgeX += badgeW + 8;
            };

            if (team1) drawBadge(team1);
            if (team1 && team2) {
                ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillStyle = '#94a3b8';
                ctx.fillText('vs.', badgeX, 82);
                badgeX += ctx.measureText('vs.').width + 8;
            }
            if (team2) drawBadge(team2);
        } else {
            const subtitleText = filterName ? `Regular Season Trajectory • ${filterName}` : 'Regular Season Trajectory • All Teams';
            ctx.fillText(subtitleText, 60, 82);
        }

        // Watermark branding
        ctx.textAlign = 'right';
        ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.fillText('THOMS FOOLERY | PROJECT ATLAS', 1530, 52);
        ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('thomsfoolery.com/tools/nfl-trend-analyzer', 1530, 76);
        ctx.textAlign = 'left';

        // Draw Chart
        ctx.drawImage(chartCanvas, 50, 105, 1500, 740);

        // Cleanup
        tempChart.destroy();

        return { canvas: exportCanvas, filename: `nfl-${metricVal}-momentum.png` };
    }

    function exportChartLight() {
        const { canvas, filename } = generateExportCanvas();
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function copyChartImage(btn) {
        const { canvas, filename } = generateExportCanvas();
        let copied = false;
        if (navigator.clipboard && window.ClipboardItem) {
            try {
                const item = new ClipboardItem({
                    'image/png': new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
                });
                await navigator.clipboard.write([item]);
                copied = true;
            } catch (err) {
                console.warn('Clipboard image write failed, falling back to download:', err);
            }
        }
        if (!copied) {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        if (btn) {
            const origHtml = btn.innerHTML;
            btn.innerHTML = copied
                ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Image Copied!</span>`
                : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Image Downloaded!</span>`;
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            setTimeout(() => {
                btn.innerHTML = origHtml;
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2400);
        }
    }

    metricSelect.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEY_METRIC, metricSelect.value);
        syncUrlParams();
        renderChart();
    });
    divisionSelect.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEY_DIVISION, divisionSelect.value);
        syncUrlParams();
        renderChart();
    });
    teamSelect.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEY_TEAM, teamSelect.value);
        syncUrlParams();
        renderChart();
        if (teamSelect.value !== 'none') {
            enrichTeamWithBoxscores(teamSelect.value);
        }
    });
    teamSelect2.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEY_TEAM2, teamSelect2.value);
        syncUrlParams();
        renderChart();
        if (teamSelect2.value !== 'none') {
            enrichTeamWithBoxscores(teamSelect2.value);
        }
    });
    
    document.getElementById('reset-zoom').addEventListener('click', () => {
        if (chartInstance) chartInstance.resetZoom();
    });

    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            metricSelect.value = 'pointDiff';
            divisionSelect.value = 'all';
            teamSelect.value = 'none';
            teamSelect2.value = 'none';
            localStorage.removeItem(STORAGE_KEY_METRIC);
            localStorage.removeItem(STORAGE_KEY_DIVISION);
            localStorage.removeItem(STORAGE_KEY_TEAM);
            localStorage.removeItem(STORAGE_KEY_TEAM2);
            syncUrlParams();
            if (chartInstance) chartInstance.resetZoom();
            renderChart();
        });
    }

    const copyChartBtn = document.getElementById('copy-chart-btn');
    if (copyChartBtn) {
        copyChartBtn.addEventListener('click', () => copyShareLink(copyChartBtn));
    }

    const copyImageBtn = document.getElementById('copy-image-btn');
    if (copyImageBtn) {
        copyImageBtn.addEventListener('click', () => copyChartImage(copyImageBtn));
    }

    const exportChartBtn = document.getElementById('export-chart-btn');
    if (exportChartBtn) {
        exportChartBtn.addEventListener('click', () => {
            const origHtml = exportChartBtn.innerHTML;
            exportChartBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Exporting...</span>`;
            try {
                exportChartLight();
            } catch (err) {
                console.error("Export error:", err);
            }
            setTimeout(() => {
                exportChartBtn.innerHTML = origHtml;
            }, 2200);
        });
    }

    fetchRealData();
});
