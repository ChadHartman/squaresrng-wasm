(module
    (func $rand
        (param $ctr i64)
        (param $key i64)
        (result i32)

        ;; uint64_t x, y, z;
        (local $x i64)
        (local $y i64)
        (local $z i64)

        ;; y = x = ctr * key;
        (local.tee $y
            (local.tee $x
                (i64.mul
                    (local.get $ctr)
                    (local.get $key)
                )
            )
        )

        ;; z = y + key;
        (local.set $z
            (i64.add
                ;; $y
                (local.get $key)
            )
        )

        ;; x = x*x + y; x = (x>>32) | (x<<32);       /* round 1 */
        (local.tee $x
            (i64.add
                (i64.mul
                    (local.get $x)
                    (local.get $x)
                )
                (local.get $y)
            )
        )

        (local.tee $x
            (i64.or
                (i64.shr_u
                    ;; $x
                    (i64.const 32)
                )
                (i64.shl
                    (local.get $x)
                    (i64.const 32)
                )
            )
        )

        ;; x = x*x + z; x = (x>>32) | (x<<32);       /* round 2 */
        (local.tee $x
            (i64.add
                (i64.mul
                    ;; $x
                    (local.get $x)
                )
                (local.get $z)
            )
        )

        (local.tee $x
            (i64.or
                (i64.shr_u
                    ;; $x
                    (i64.const 32)
                )
                (i64.shl
                    (local.get $x)
                    (i64.const 32)
                )
            )
        )

        ;; x = x*x + y; x = (x>>32) | (x<<32);       /* round 3 */
        (local.tee $x
            (i64.add
                (i64.mul
                    ;; $x
                    (local.get $x)
                )
                (local.get $y)
            )
        )
        (local.tee $x
            (i64.or
                (i64.shr_u
                    ;; $x
                    (i64.const 32)
                )
                (i64.shl
                    (local.get $x)
                    (i64.const 32)
                )
            )
        )

        ;; return (x*x + z) >> 32;                   /* round 4 */
        (i32.wrap_i64
            (i64.shr_u
                (i64.add
                    (i64.mul
                        ;; $x
                        (local.get $x)
                    )
                    (local.get $z)
                )
                (i64.const 32)
            )
        )
    )
    (export "rand" (func $rand))

    (func (export "randF")
        (param $ctr i64)
        (param $key i64)
        (result f64)

        (f64.div
            (f64.convert_i32_u
                (call $rand (local.get $ctr) (local.get $key))
            )
            ;; Max i32_u
            (f64.const 0xffffffff)
        )
    )

    (func (export "randBound")
        (param $ctr i64)
        (param $key i64)
        (param $min i32)
        (param $max i32)
        (result i32)

        (local $delta i32)

        (local.set $delta
            (i32.sub
                ;; Add 1 to be max inclusive
                (i32.add
                    (local.get $max)
                    (i32.const 1)
                )
                (local.get $min)
            )
        )

        (i32.add
            (i32.rem_u
                (call $rand (local.get $ctr) (local.get $key))
                (local.get $delta)
            )
            (local.get $min)
        )
    )
)