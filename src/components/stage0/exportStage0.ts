import * as XLSX from 'xlsx';
import type { Stage } from '@/data/types';

export function exportStage0ToExcel(stage: Stage): void {
  const workbook = XLSX.utils.book_new();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const joinList = (xs?: string[]) => (xs && xs.length ? xs.join('\n') : '');

  // Helper to auto-size columns based on content
  const autoFit = (sheet: XLSX.WorkSheet, data: Record<string, unknown>[]) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const widths = keys.map((key) => {
      let max = key.length;
      for (const row of data) {
        const val = String(row[key] ?? '');
        // Cap width per line
        for (const line of val.split('\n')) {
          if (line.length > max) max = line.length;
        }
      }
      return { wch: Math.min(Math.max(max + 2, 10), 60) };
    });
    sheet['!cols'] = widths;
  };

  // ============ 1. Summary Sheet ============
  const totalActivities = stage.weeks.reduce((s, w) => s + w.activities.length, 0);
  const doneActivities = stage.weeks.reduce(
    (s, w) => s + w.activities.filter((a) => a.status === 'done').length,
    0
  );
  const summaryData = [
    { Metric: 'Stage', Value: stage.title },
    { Metric: 'Subtitle', Value: stage.subtitle || '' },
    { Metric: 'Status', Value: stage.status },
    { Metric: 'Total Activities', Value: totalActivities },
    { Metric: 'Completed Activities', Value: doneActivities },
    {
      Metric: 'Completion %',
      Value: totalActivities ? Math.round((doneActivities / totalActivities) * 100) + '%' : '0%',
    },
    { Metric: 'Total Zones', Value: (stage.plantZones || []).length },
    {
      Metric: 'Zones with Team Lead',
      Value: (stage.plantZones || []).filter((z) => z.teamLead && z.teamLead.trim().length > 0).length,
    },
    { Metric: 'Supplies — Ordered', Value: (stage.supplies || []).filter((s) => s.ordered).length },
    { Metric: 'Supplies — Acquired', Value: (stage.supplies || []).filter((s) => s.acquired).length },
    { Metric: 'Red Tags — Total', Value: (stage.redTags || []).length },
    { Metric: 'Red Tags — Pending', Value: (stage.redTags || []).filter((t) => t.disposition === 'pending').length },
    { Metric: 'Maintenance Tags — Open', Value: (stage.maintenanceTags || []).filter((t) => !t.resolved).length },
    { Metric: 'Maintenance Tags — Resolved', Value: (stage.maintenanceTags || []).filter((t) => t.resolved).length },
    { Metric: 'Huddle Logs Recorded', Value: (stage.huddleLogs || []).length },
    { Metric: 'Photos Uploaded', Value: (stage.photos || []).length },
    { Metric: 'Generated', Value: new Date().toLocaleString() },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  autoFit(summarySheet, summaryData as unknown as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // ============ 2. Activities (with all detail fields) ============
  const activitiesData = stage.weeks.flatMap((week) =>
    week.activities.map((a) => ({
      Week: week.number,
      Day: a.day,
      Time: a.time || '',
      Description: a.description,
      Owner: a.owner,
      Duration: a.duration ? `${a.duration} min` : '',
      Location: a.location || '',
      Status: a.status,
      '5S Step': a.fiveStep || '',
      Blitz: a.isBlitz ? 'Yes' : '',
      'Detail Steps': joinList(a.detailSteps),
      'Success Looks Like': a.successLooksLike || '',
      'Common Mistakes': joinList(a.commonMistakes),
      Deliverable: a.deliverable || '',
      'Related Zones': (a.relatedZones || []).join(', '),
      'Related Supplies': (a.relatedSupplies || []).join(', '),
      'SOP Refs': (a.sopRefs || []).join(', '),
      'Finding Refs': (a.findingRefs || []).join(', '),
      'Rec Refs': (a.recRefs || []).join(', '),
      'Waste Refs': (a.wasteRefs || []).join(', '),
      Notes: a.notes || '',
      'Completed At': formatDate(a.completedAt),
    }))
  );
  const activitiesSheet = XLSX.utils.json_to_sheet(activitiesData);
  autoFit(activitiesSheet, activitiesData as unknown as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(workbook, activitiesSheet, 'Activities');

  // ============ 3. Zones ============
  const zonesData = (stage.plantZones || []).map((zone) => ({
    ID: zone.id,
    Letter: zone.letter,
    Name: zone.name,
    Description: zone.description || '',
    'Key Contents': (zone.keyContents || []).join('; '),
    'Team Lead': zone.teamLead,
  }));
  const zonesSheet = XLSX.utils.json_to_sheet(zonesData);
  autoFit(zonesSheet, zonesData as unknown as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(workbook, zonesSheet, 'Zones');

  // ============ 4. 5S Scores (long format for easier pivots) ============
  const weekKeys = ['baseline', 'week2', 'week3', 'week4'] as const;
  const fiveSData = (stage.fiveSZones || []).flatMap((zone) =>
    weekKeys.map((wk) => {
      const s = zone.weeklyScores?.[wk];
      const sum =
        (s?.sort || 0) +
        (s?.setInOrder || 0) +
        (s?.shine || 0) +
        (s?.standardize || 0) +
        (s?.sustain || 0);
      return {
        Zone: zone.name,
        'Zone ID': zone.id,
        Week: wk,
        Sort: s?.sort ?? '',
        'Set in Order': s?.setInOrder ?? '',
        Shine: s?.shine ?? '',
        Standardize: s?.standardize ?? '',
        Sustain: s?.sustain ?? '',
        Total: s ? sum : '',
        Notes: s?.notes || '',
      };
    })
  );
  const fiveSSheet = XLSX.utils.json_to_sheet(fiveSData);
  autoFit(fiveSSheet, fiveSData as unknown as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(workbook, fiveSSheet, '5S Scores');

  // ============ 5. Supplies ============
  const suppliesData = (stage.supplies || []).map((item) => ({
    ID: item.id,
    Item: item.item,
    Quantity: item.quantity,
    'Needed By': item.neededBy || '',
    Ordered: item.ordered ? 'Yes' : 'No',
    Acquired: item.acquired ? 'Yes' : 'No',
    Notes: (item as { notes?: string }).notes || '',
  }));
  const suppliesSheet = XLSX.utils.json_to_sheet(suppliesData);
  autoFit(suppliesSheet, suppliesData as unknown as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(workbook, suppliesSheet, 'Supplies');

  // ============ 6. Red Tags ============
  const redTagsData = (stage.redTags || []).map((tag) => {
    const zone = stage.plantZones?.find((z) => z.id === tag.zone);
    return {
      ID: tag.id,
      Zone: zone ? `${zone.letter} - ${zone.name}` : tag.zone,
      Item: tag.item,
      Reason: tag.reason,
      Disposition: tag.disposition,
      'Tagged At': formatDate(tag.taggedAt),
      'Disposed At': formatDate(tag.disposedAt),
    };
  });
  const redTagsSheet = XLSX.utils.json_to_sheet(redTagsData);
  autoFit(redTagsSheet, redTagsData as unknown as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(workbook, redTagsSheet, 'Red Tags');

  // ============ 7. Maintenance Tags ============
  const maintenanceTagsData = (stage.maintenanceTags || []).map((tag) => {
    const zone = stage.plantZones?.find((z) => z.id === tag.zone);
    return {
      ID: tag.id,
      Zone: zone ? `${zone.letter} - ${zone.name}` : tag.zone,
      Location: tag.location,
      Description: tag.description,
      Priority: tag.priority,
      Resolved: tag.resolved ? 'Yes' : 'No',
      'Created At': formatDate(tag.createdAt),
      'Resolved At': formatDate(tag.resolvedAt),
    };
  });
  const maintenanceTagsSheet = XLSX.utils.json_to_sheet(maintenanceTagsData);
  autoFit(maintenanceTagsSheet, maintenanceTagsData as unknown as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(workbook, maintenanceTagsSheet, 'Maintenance Tags');

  // ============ 8. Huddle Logs ============
  const huddleLogsData = (stage.huddleLogs || []).map((log) => ({
    ID: log.id,
    Date: formatDate(log.date),
    Week: log.week,
    Facilitator: log.facilitator,
    'Safety Topic': log.safety,
    "Yesterday's Achievements": log.yesterday,
    "Today's Plan": log.today,
    'Problems / Blockers': log.problems,
    'Help Needed': log.helpNeeded,
    Shoutout: log.shoutout,
  }));
  const huddleLogsSheet = XLSX.utils.json_to_sheet(huddleLogsData);
  autoFit(huddleLogsSheet, huddleLogsData as unknown as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(workbook, huddleLogsSheet, 'Huddle Logs');

  // ============ 9. Photos (metadata only — images not embedded) ============
  const photosData = (stage.photos || []).map((p) => ({
    ID: p.id,
    Caption: p.caption,
    Zone: p.zone || '',
    'Taken At': formatDate(p.takenAt),
    Tags: (p.tags || []).join(', '),
    'Has Image': p.url ? 'Yes' : 'No',
  }));
  const photosSheet = XLSX.utils.json_to_sheet(photosData);
  autoFit(photosSheet, photosData as unknown as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(workbook, photosSheet, 'Photos');

  // ============ 10. KPIs ============
  const kpisData = (stage.kpis || []).map((kpi) => ({
    Name: kpi.name,
    Unit: kpi.unit,
    Baseline: kpi.baseline,
    Target: kpi.target,
    'Week 1': kpi.weeklyValues?.week1 ?? '',
    'Week 2': kpi.weeklyValues?.week2 ?? '',
    'Week 3': kpi.weeklyValues?.week3 ?? '',
    'Week 4': kpi.weeklyValues?.week4 ?? '',
  }));
  const kpisSheet = XLSX.utils.json_to_sheet(kpisData);
  autoFit(kpisSheet, kpisData as unknown as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(workbook, kpisSheet, 'KPIs');

  // ============ 11. Exit Criteria ============
  const exitCriteriaData = (stage.exitCriteria || []).map((criterion) => ({
    Description: criterion.description,
    Met: criterion.met ? 'Yes' : 'No',
    'Evidence Required': criterion.evidenceRequired || '',
    'Target Date': formatDate(criterion.targetDate),
    Notes: criterion.notes || '',
  }));
  const exitCriteriaSheet = XLSX.utils.json_to_sheet(exitCriteriaData);
  autoFit(exitCriteriaSheet, exitCriteriaData as unknown as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(workbook, exitCriteriaSheet, 'Exit Criteria');

  // Generate and download
  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Stage_0_5S_Blitz_${timestamp}.xlsx`);
}
