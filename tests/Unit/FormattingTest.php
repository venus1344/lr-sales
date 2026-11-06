<?php

namespace Tests\Unit;

use App\Support\Formatting;
use PHPUnit\Framework\TestCase;

class FormattingTest extends TestCase
{
    public function test_tin_formats_nine_digits(): void
    {
        $this->assertSame('123-456-789', Formatting::tin('123456789'));
    }

    public function test_tin_returns_input_when_not_nine_digits(): void
    {
        $this->assertSame('12345', Formatting::tin('12345'));
    }

    public function test_tin_returns_null_for_blank(): void
    {
        $this->assertNull(Formatting::tin(null));
        $this->assertNull(Formatting::tin(''));
        $this->assertNull(Formatting::tin('   '));
    }

    public function test_vrn_formats_nine_characters_and_uppercases_last(): void
    {
        $this->assertSame('12-345678-A', Formatting::vrn('12345678a'));
    }

    public function test_vrn_returns_input_when_not_nine_characters(): void
    {
        $this->assertSame('1234', Formatting::vrn('1234'));
    }

    public function test_date_formats_as_month_day_year(): void
    {
        $this->assertSame('Nov 06, 26', Formatting::date('2026-11-06'));
    }
}
