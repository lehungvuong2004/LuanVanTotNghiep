<?php

namespace App\Services;

use App\Models\HelperAvailability;
use Illuminate\Support\Facades\DB;

class AvailabilityService
{
    /**
     * Perform bulk availability operation.
     *
     * @param int $helperId
     * @param string $action
     * @param array $slots
     * @return array
     */
    public function bulkOperation(int $helperId, string $action, array $slots): array
    {
        $uniqueSlots = [];
        foreach ($slots as $slot) {
            $key = $slot['available_date'] . '|' . $slot['start_time'];
            $uniqueSlots[$key] = $slot;
        }
        $slots = array_values($uniqueSlots);

        $created = 0;
        $ignored = 0;
        $deleted = 0;

        if ($action === 'create') {
            $dataToInsert = [];
            foreach ($slots as $slot) {
                $startTime = strlen($slot['start_time']) === 5 
                    ? $slot['start_time'] . ':00' 
                    : $slot['start_time'];

                $dataToInsert[] = [
                    'helper_id'      => $helperId,
                    'available_date' => $slot['available_date'],
                    'start_time'     => $startTime,
                    'status'         => 'available',
                ];
            }

            // Entire bulk create process must be inside a transaction
            DB::transaction(function () use ($dataToInsert, &$created, &$ignored) {
                // Chunk records into batches of 100 to reduce memory and hit MySQL database limits cleanly
                $chunks = array_chunk($dataToInsert, 100);
                foreach ($chunks as $chunk) {
                    $inserted = HelperAvailability::insertOrIgnore($chunk);
                    $created += $inserted;
                    $ignored += (count($chunk) - $inserted);
                }
            });
        } else if ($action === 'delete') {
            DB::transaction(function () use ($helperId, $slots, &$deleted) {
                $chunks = array_chunk($slots, 100);
                foreach ($chunks as $chunk) {
                    $query = HelperAvailability::where('helper_id', $helperId)
                        ->where('status', 'available');

                    $query->where(function ($q) use ($chunk) {
                        $isFirst = true;
                        foreach ($chunk as $slot) {
                            $startTime = strlen($slot['start_time']) === 5 
                                ? $slot['start_time'] . ':00' 
                                : $slot['start_time'];

                            if ($isFirst) {
                                $q->where(function ($subQ) use ($slot, $startTime) {
                                    $subQ->where('available_date', $slot['available_date'])
                                         ->where('start_time', $startTime);
                                });
                                $isFirst = false;
                            } else {
                                $q->orWhere(function ($subQ) use ($slot, $startTime) {
                                    $subQ->where('available_date', $slot['available_date'])
                                         ->where('start_time', $startTime);
                                });
                            }
                        }
                    });

                    $deleted += $query->delete();
                }
            });
        }

        return [
            'created' => $created,
            'ignored' => $ignored,
            'deleted' => $deleted,
        ];
    }
}
