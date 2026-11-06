<?php

namespace App\Support;

/**
 * Formatting helpers for tax identifiers and dates.
 *
 * Replaces the buggy `formatTIN`/`formatVRN`/`datey` global functions from the
 * legacy app (the old `formatVRN` length check was always false due to operator
 * precedence, so it formatted every value).
 */
class Formatting
{
    /**
     * Format a 9-character TIN as "XXX-XXX-XXX". Returns input unchanged otherwise.
     */
    public static function tin(?string $tin): ?string
    {
        $tin = trim((string) $tin);

        if ($tin === '') {
            return null;
        }

        return strlen($tin) === 9
            ? substr($tin, 0, 3).'-'.substr($tin, 3, 3).'-'.substr($tin, 6, 3)
            : $tin;
    }

    /**
     * Format a 9-character VRN as "XX-XXXXXX-X". Returns input unchanged otherwise.
     */
    public static function vrn(?string $vrn): ?string
    {
        $vrn = trim((string) $vrn);

        if ($vrn === '') {
            return null;
        }

        return strlen($vrn) === 9
            ? substr($vrn, 0, 2).'-'.substr($vrn, 2, 6).'-'.strtoupper(substr($vrn, 8, 1))
            : $vrn;
    }

    /**
     * Format a date as "M d, y" (e.g. "Nov 06, 26").
     */
    public static function date(?string $date): ?string
    {
        if (blank($date)) {
            return null;
        }

        return date('M d, y', strtotime($date));
    }
}
